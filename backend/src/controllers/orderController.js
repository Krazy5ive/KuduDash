// controllers/orderController.js
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { checkout } = require("../services/checkoutService");

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ student: req.query.student })
      .populate("vendor", "businessName location")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("student", "firstName lastName email")
      .populate("vendor", "businessName location");
    if (!order) return res.status(404).json({ message: "Order not found" });
    // make sure students can only see their own orders
    if (order.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorised" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const studentId = req.body.studentId;
    const order = await checkout(studentId);
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const validStatuses = [
    "pending",
    "paid",
    "received",
    "preparing",
    "ready",
    "collected",
    "cancelled",
  ];

  try {
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    
    // When payment confirmed, delete the pending cart
    if (req.body.status === "paid") {
      await Cart.findOneAndDelete({ 
        student: order.student, 
        status: "pending" 
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrderStatus };