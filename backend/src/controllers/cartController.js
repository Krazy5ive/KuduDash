const Cart = require("../models/Cart");

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ student: req.params.studentId })
      .populate("items.menuItem")
      .populate("vendor", "businessName location");
    if (!cart) return res.status(404).json({ message: "Cart is empty" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { studentId, vendorId, menuItem, name, unitPrice, quantity, specialNote } = req.body;
    let cart = await Cart.findOne({ student: studentId });

    if (!cart) {
      cart = new Cart({
        student: studentId,
        vendor: vendorId,
        items: [{ menuItem, name, unitPrice, quantity, specialNote }],
        totalAmount: unitPrice  * quantity,
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.menuItem.toString() === menuItem
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ menuItem, name, unitPrice, quantity, specialNote });
      }
      cart.totalAmount = cart.items.reduce(
        (total, item) => total + item.unitPrice * item.quantity, 0
      );
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ student: req.params.studentId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = quantity;
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.unitPrice * item.quantity, 0
    );
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ student: req.params.studentId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.unitPrice * item.quantity, 0
    );
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ student: req.params.studentId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };