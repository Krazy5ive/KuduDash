const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require("../controllers/cartController");

router.get("/:studentId", getCart);
router.post("/", addToCart);
router.put("/:studentId/items/:itemId", updateCartItem);
router.delete("/:studentId/items/:itemId", removeFromCart);
router.delete("/:studentId", clearCart);

module.exports = router;