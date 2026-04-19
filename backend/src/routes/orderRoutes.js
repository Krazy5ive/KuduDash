const express = require("express");
const router  = express.Router();

const {
  getOrders,
  getVendorOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

const { verifyToken, attachStudent, attachVendor } = require("../middleware/auth");

// ── Student routes ───────────────────────────────────────────────────
// GET  /api/orders             → student's own orders (polled by OrderTracking)
router.get(   "/",            verifyToken, attachStudent, getOrders);

// POST /api/orders             → place a new order
router.post(  "/",            verifyToken, attachStudent, createOrder);

// ── Vendor routes ────────────────────────────────────────────────────
// GET  /api/orders/vendor      → all orders for the authenticated vendor
router.get(   "/vendor",      verifyToken, attachVendor,  getVendorOrders);

// PATCH /api/orders/:id/status → vendor advances order status
router.patch( "/:id/status",  verifyToken, attachVendor,  updateOrderStatus);

// ── Shared ───────────────────────────────────────────────────────────
// GET  /api/orders/:id         → single order detail
router.get(   "/:id",         verifyToken, attachStudent, getOrderById);

module.exports = router;