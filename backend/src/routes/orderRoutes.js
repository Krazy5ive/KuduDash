// orderRoutes.js
const express = require("express");
const router = express.Router();
const { getOrders, getOrderById, createOrder, updateOrderStatus } = require("../controllers/orderController");
const { verifyToken, attachStudent } = require("../middleware/auth");

router.get("/",          verifyToken, attachStudent, getOrders);
router.get("/:id",       verifyToken, attachStudent, getOrderById);
router.post("/",         verifyToken, attachStudent, createOrder);
router.put("/:id/status",verifyToken, attachStudent, updateOrderStatus);

module.exports = router;