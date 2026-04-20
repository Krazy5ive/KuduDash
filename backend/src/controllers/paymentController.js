const crypto = require('crypto');
const Order  = require('../models/Order');

const PF_MERCHANT_ID  = process.env.PF_MERCHANT_ID;
const PF_MERCHANT_KEY = process.env.PF_MERCHANT_KEY;
const PF_PASSPHRASE   = process.env.PF_PASSPHRASE;
const PF_URL = process.env.NODE_ENV === 'production'
  ? 'https://www.payfast.co.za/eng/process'
  : 'https://sandbox.payfast.co.za/eng/process';

function buildSignature(data, passphrase) {
  let str = Object.entries(data)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`)
    .join('&');
  if (passphrase) str += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  return crypto.createHash('md5').update(str).digest('hex');
}

// POST /api/payments/initiate
exports.initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('student', 'firstName lastName email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.student._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });
    if (order.status === 'paid')
      return res.status(400).json({ message: 'Order already paid' });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const notifyUrl   = process.env.PF_NOTIFY_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/notify`;

    const pfData = {
      merchant_id:   PF_MERCHANT_ID,
      merchant_key:  PF_MERCHANT_KEY,
      return_url:    `${frontendUrl}/payment/result/${orderId}`,
      cancel_url:    `${frontendUrl}/payment/result/${orderId}?cancelled=true`,
      notify_url:    notifyUrl,
      name_first:    order.student.firstName  || 'Student',
      name_last:     order.student.lastName   || '',
      email_address: order.student.email      || '',
      m_payment_id:  orderId.toString(),
      amount:        order.totalAmount.toFixed(2),
      item_name:     `KuduDash Order #${orderId.toString().slice(-6)}`,
    };

    pfData.signature = buildSignature(pfData, PF_PASSPHRASE);

    res.json({ pfData, pfUrl: PF_URL });
  } catch (err) {
    console.error('[initiatePayment]', err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments/notify  (PayFast ITN — no JWT, PayFast signs it)
exports.handleNotify = async (req, res) => {
  try {
    const data = { ...req.body };
    const receivedSig = data.signature;
    delete data.signature;

    const expectedSig = buildSignature(data, PF_PASSPHRASE);
    if (receivedSig !== expectedSig) {
      console.error('[handleNotify] Signature mismatch');
      return res.status(400).send('Invalid signature');
    }

    if (data.payment_status === 'COMPLETE') {
      const order = await Order.findById(data.m_payment_id);
      if (order && order.status !== 'paid') {
        order.status    = 'paid';
        order.paidAt    = new Date();
        await order.save();
        console.log(`✅ Payment confirmed for order ${order._id}`);
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('[handleNotify]', err);
    res.status(500).send('Error');
  }
};

// GET /api/payments/verify/:orderId
// Called by the frontend after PayFast redirects back to return_url.
// If the order is still "received" (ITN couldn't reach localhost in dev),
// promote it to "paid" here — the student is authenticated and owns the order.
// In production, ITN fires first so the order is already "paid" on arrival.
exports.verifyPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.student.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });

    if (order.status === 'received') {
      order.status = 'paid';
      order.paidAt = new Date();
      await order.save();
      console.log(`✅ [verifyPayment] Promoted order ${order._id} to paid (ITN fallback)`);
    }

    res.json({ status: order.status });
  } catch (err) {
    console.error('[verifyPayment]', err);
    res.status(500).json({ message: err.message });
  }
};
