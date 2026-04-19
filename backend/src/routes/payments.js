const express  = require('express');
const router   = express.Router();
const { checkJwt, checkVendor } = require('../middleware/auth');    // your existing Auth0 middleware
const ctrl     = require('../controllers/paymentController');

// ── Student-facing routes (require student JWT) ───────────────────────────────

// Create a Stripe PaymentIntent for an order
router.post('/create-intent', checkJwt, ctrl.createPaymentIntent);

// Verify payment status after Stripe redirects back (also handles UAT 4 amount check)
router.get('/verify/:orderId', checkJwt, ctrl.verifyPayment);

// ── Vendor-facing route ────────────────────────────────────────────────────────

// UAT 5: vendor earnings / confirmed payments dashboard data
router.get('/vendor/earnings', checkJwt, checkVendor, ctrl.getVendorEarnings);

// ── Stripe webhook (NO JWT — signed by Stripe instead) ────────────────────────
// NOTE: Mount this BEFORE express.json() in server.js so the raw body is preserved.
// In server.js: app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentRouter)
router.post('/webhook', ctrl.handleWebhook);

module.exports = router;
