const express = require("express");
const router  = express.Router();

const {
  getOrders,
  getVendorOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getAllOrders,
  getOrdersByStudent,
  getOrdersByVendor,
} = require("../controllers/orderController");

const { 
  verifyToken, 
  attachStudent, 
  attachVendor,
  attachAdmin,
} = require("../middleware/auth");

// ── Admin routes ─────────────────────────────────────────────────────
router.get("/admin/all",                 getAllOrders);
router.get("/admin/student/:studentId",  verifyToken, attachAdmin, getOrdersByStudent);
router.get("/admin/vendor/:vendorId",    verifyToken, attachAdmin, getOrdersByVendor);

// ── Student routes ────────────────────────────────────────────────────
router.get(   "/",           verifyToken, attachStudent, getOrders);
router.post(  "/",           verifyToken, attachStudent, createOrder);
router.get(   "/:id",        verifyToken, attachStudent, getOrderById);
router.patch( "/:id/status", verifyToken, attachVendor,  updateOrderStatus);

//all orders for admin
router.get("/admin/all", verifyToken, attachAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("vendor", "businessName")
      .populate("student", "firstName lastName")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;  