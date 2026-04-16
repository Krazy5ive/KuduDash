// orderRoutes.js
const express = require("express");
const router = express.Router();
const { getOrders, getOrderById, createOrder, updateOrderStatus } = require("../controllers/orderController");

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id/status", updateOrderStatus);

module.exports = router;