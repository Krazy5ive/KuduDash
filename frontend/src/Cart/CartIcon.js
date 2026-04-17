import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "./CartContext";
import "./CartIcon.css";

const CartIcon = () => {
  const { cartCount } = useCart();
  return (
    <Link to="/cart" className="kd-cart-icon-link">
      <span className="kd-cart-icon">🛒</span>
      {cartCount > 0 && (
        <output className="kd-cart-badge">{cartCount}</output>
      )}
    </Link>
  );
};

export default CartIcon;