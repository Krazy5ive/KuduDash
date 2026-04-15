import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "./AddToCart.css";

const AddToCartButton = ({ item, vendorId, vendorName }) => {
  const { addToCart } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = () => {
    addToCart(item, vendorId, vendorName);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <footer className="kd-add-to-cart-container">
      <button
        className="kd-add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={item.soldOut}
      >
        {item.soldOut ? "Sold Out" : "Add to Cart"}
      </button>
      {showSuccess && (
        <span className="kd-add-success">✓ Added!</span>
      )}
    </footer>
  );
};

export default AddToCartButton;