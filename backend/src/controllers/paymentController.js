const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order  = require('../models/Order');

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent for an existing order.
 * Called by the student's Payment page immediately on load.
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    const studentId   = req.user.sub;                   // injected by Auth0 middleware

    const order = await Order.findById(orderId);

    if (!order)                              return res.status(404).json({ message: 'Order not found' });
    if (order.studentId !== studentId)       return res.status(403).json({ message: 'Forbidden' });
    if (order.paymentStatus === 'paid')      return res.status(400).json({ message: 'Order already paid' });

    // Stripe amounts are in the smallest currency unit (cents / cents-equivalent).
    // South African Rand (ZAR) uses subunits of 1/100, so multiply by 100.
    const amountInCents = Math.round(order.totalAmount * 100);

    // Reuse an existing intent if one already exists (idempotent retry support)
    let paymentIntent;
    if (order.paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);

      // If the intent is still actionable, return it as-is
      if (['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(paymentIntent.status)) {
        return res.json({ clientSecret: paymentIntent.client_secret });
      }
    }

    // Create a fresh PaymentIntent
    paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInCents,
      currency: 'zar',
      metadata: {
        orderId:    orderId.toString(),
        vendorId:   order.vendorId.toString(),
        studentId,
      },
      // Automatic payment methods lets Stripe surface the best options for the region
      automatic_payment_methods: { enabled: true },
    });

    // Persist the intent ID so we can reconcile later
    order.paymentIntentId = paymentIntent.id;
    order.paymentStatus   = 'pending';
    await order.save();

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('[createPaymentIntent]', err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/payments/webhook
 * Stripe sends signed webhook events here.
 * Must be mounted BEFORE express.json() so the raw body is preserved.
 */
exports.handleWebhook = async (req, res) => {
  const sig     = req.headers['stripe-signature'];
  const secret  = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {

      // ── UAT 1: Happy path — payment succeeded ─────────────────────────────
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        const order  = await Order.findOne({ paymentIntentId: intent.id });

        if (!order) { console.warn('No order for intent', intent.id); break; }

        order.paymentStatus  = 'paid';
        order.orderStatus    = 'confirmed';
        order.paymentMethod  = intent.payment_method_types?.[0] ?? 'card';
        order.paidAt         = new Date();
        await order.save();

        // TODO: emit Socket.io event to vendor dashboard & send push notification
        console.log(`✅ Payment confirmed for order ${order._id} (vendor ${order.vendorId})`);
        break;
      }

      // ── UAT 2: Insufficient funds / card declined ──────────────────────────
      case 'payment_intent.payment_failed': {
        const intent        = event.data.object;
        const failureReason = intent.last_payment_error?.message ?? 'Unknown reason';
        const order         = await Order.findOne({ paymentIntentId: intent.id });

        if (!order) break;

        order.paymentStatus = 'failed';
        // Keep orderStatus as 'awaiting_payment' so the student can retry
        await order.save();

        console.log(`❌ Payment failed for order ${order._id}: ${failureReason}`);
        // TODO: emit Socket.io event to vendor & student
        break;
      }

      // ── UAT 3: Timeout / network error — intent cancelled by Stripe ────────
      case 'payment_intent.canceled': {
        const intent = event.data.object;
        const order  = await Order.findOne({ paymentIntentId: intent.id });

        if (!order) break;

        // Only mark failed if still pending (don't overwrite a 'paid' order)
        if (order.paymentStatus === 'pending') {
          order.paymentStatus = 'failed';
          await order.save();
        }

        console.log(`⏱ Payment intent cancelled for order ${order._id}`);
        break;
      }

      default:
        // Ignore events we don't handle
        break;
    }
  } catch (err) {
    console.error('[webhook handler]', err);
    // Return 200 so Stripe doesn't keep retrying; log for ops review
    return res.status(200).json({ received: true, error: err.message });
  }

  return res.json({ received: true });
};

/**
 * GET /api/payments/verify/:orderId
 * Called by the frontend after Stripe redirects back.
 * UAT 4: also validates that the amount on the PaymentIntent matches the order.
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId }  = req.params;
    const studentId    = req.user.sub;

    const order = await Order.findById(orderId);
    if (!order)                        return res.status(404).json({ message: 'Order not found' });
    if (order.studentId !== studentId) return res.status(403).json({ message: 'Forbidden' });

    // If the webhook already processed this, return current state
    if (order.paymentStatus === 'paid') {
      return res.json({ status: 'paid', order });
    }

    if (!order.paymentIntentId) {
      return res.json({ status: order.paymentStatus, order });
    }

    // Pull fresh state from Stripe
    const intent         = await stripe.paymentIntents.retrieve(order.paymentIntentId);
    const expectedAmount = Math.round(order.totalAmount * 100);

    // ── UAT 4: Detect amount mismatch ──────────────────────────────────────
    if (intent.status === 'succeeded' && intent.amount_received !== expectedAmount) {
      console.error(
        `[verifyPayment] Amount mismatch on order ${orderId}: ` +
        `expected ${expectedAmount}, got ${intent.amount_received}`
      );
      // Mark as failed and log for admin; do NOT credit the vendor
      order.paymentStatus = 'failed';
      await order.save();

      // TODO: create an AdminAlert document for ops review
      return res.status(422).json({
        message: 'Payment amount mismatch. Transaction rejected.',
        expected: expectedAmount,
        received: intent.amount_received,
      });
    }

    // Reconcile in case webhook was delayed
    if (intent.status === 'succeeded') {
      order.paymentStatus = 'paid';
      order.orderStatus   = 'confirmed';
      order.paidAt        = new Date();
      await order.save();
    }

    return res.json({ status: order.paymentStatus, order });
  } catch (err) {
    console.error('[verifyPayment]', err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/vendor/earnings
 * UAT 5: Vendor views their confirmed payments in the dashboard.
 */
exports.getVendorEarnings = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;             // set by vendor-auth middleware

    const paidOrders = await Order.find({
      vendorId,
      paymentStatus: 'paid',
    }).sort({ paidAt: -1 });

    const totalEarnings = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return res.json({
      totalEarnings,
      orderCount: paidOrders.length,
      orders: paidOrders,
    });
  } catch (err) {
    console.error('[getVendorEarnings]', err);
    return res.status(500).json({ message: err.message });
  }
};
