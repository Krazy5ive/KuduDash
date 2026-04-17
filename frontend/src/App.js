import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./Login";
import Vibe from "./Vibe";
import Student from "./Dashboards/Student";
import Vendor from "./Dashboards/Vendor";
import Admin from "./Dashboards/Admin";
import Cart from "./Cart/Cart";
import AddToCart from "./Cart/AddToCart";
import { CartProvider } from "./Cart/CartContext";
import CartIcon from "./Cart/CartIcon";
import Checkout from "./Cart/Checkout";

function App() {
  const location = useLocation();
  return (
    <CartProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Login />} />
          <Route path="/vibe" element={<Vibe />} />
          <Route path="/dashboard/student" element={<Student />} />
          <Route path="/dashboard/vendor" element={<Vendor />} />
          <Route path="/dashboard/admin" element={<Admin />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-to-cart" element={<AddToCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart-icon" element={<CartIcon />} />
        </Routes>
      </AnimatePresence>
    </CartProvider>
  );
}

export default App;