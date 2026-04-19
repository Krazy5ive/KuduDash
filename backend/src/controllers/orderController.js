const Order = require("../models/Order");

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ student: req.user._id })
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
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { vendorId, items, totalAmount } = req.body;
    if (!vendorId || !items?.length || !totalAmount) {
      return res.status(400).json({ message: "Missing required order fields" });
    }
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = new Order({
      student:     req.user._id,
      vendor:      vendorId,
      items:       items.map((i) => ({
        menuItem:  i.menuItem,
        name:      i.name,
        unitPrice: i.price,
        quantity:  i.quantity,
        subtotal:  i.price * i.quantity,
      })),
      subtotal,
      totalAmount: subtotal,
      status:      "pending",
    });
    await order.save();
    res.status(201).json({ order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrderStatus };