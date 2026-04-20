const express = require('express');
const router  = express.Router();
const { verifyToken, attachStudent } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');

// Student initiates payment for a confirmed order
router.post('/initiate',         verifyToken, attachStudent, ctrl.initiatePayment);

// PayFast ITN callback — no JWT, signed by PayFast
router.post('/notify',           ctrl.handleNotify);

// Frontend polls this after PayFast redirects back
router.get('/verify/:orderId',   verifyToken, attachStudent, ctrl.verifyPayment);

module.exports = router;
