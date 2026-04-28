const express = require("express");
const router  = express.Router();

const {
  getOrders,
  getVendorOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/orderController");

const { verifyToken, attachStudent, attachVendor } = require("../middleware/auth");

// ── Admin routes ───────────────────────────────────────────────────
router.get("/admin/all", getAllOrders);

// ── Student routes ───────────────────────────────────────────────────
router.get(   "/",            verifyToken, attachStudent, getOrders);
router.post(  "/",            verifyToken, attachStudent, createOrder);
router.get(   "/:id",         verifyToken, attachStudent, getOrderById);
router.patch( "/:id/status",  verifyToken, attachVendor,  updateOrderStatus);

module.exports = router;