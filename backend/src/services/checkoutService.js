require("../models/MenuItem");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

const checkout = async (studentId) => {
  const cart = await Cart.findOne({
    student: studentId,
    status: "active" 
  }).populate("items.menuItem");

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const orderItems = cart.items.map((item) => ({
    menuItem: item.menuItem._id,
    name: item.name,
    unitPrice: item.unitPrice, 
    quantity: item.quantity,
    subtotal: item.unitPrice * item.quantity,
    specialNote: item.specialNote,
  }));

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  const order = await Order.create({
    student: cart.student,
    vendor: cart.vendor,
    items: orderItems,
    subtotal,
    totalAmount: subtotal, // add fees/discounts here later
    status: "pending",
  });

  cart.status = "pending";
  await cart.save();

  return order;
};

module.exports = { checkout };