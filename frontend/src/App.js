// App.js
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./Login";
import Vibe from "./Vibe";
import Student from "./Dashboards/Student";
import Vendor from "./Dashboards/Vendor";
import Admin from "./Dashboards/Admin";
import PaymentPage from "./payment/Payment";
import { CartProvider } from "./Cart/CartContext";
import Callback from "./Callback";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/"         element={<Login />} />
        <Route path="/vibe"     element={<Vibe />} />
        <Route path="/callback" element={<Callback />} />

        {/* Role-protected dashboard routes */}
        <Route
          path="/dashboard/vendor"
          element={
            <ProtectedRoute requiredRole="vendor">
              <Vendor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute requiredRole="student">
              <CartProvider>
                <Student />
              </CartProvider>
            </ProtectedRoute>
          }
        />

        {/* Payment routes — student only but role is already enforced
            upstream; keeping CartProvider here is sufficient */}
        <Route
          path="/payment/:orderId"
          element={
            <CartProvider>
              <PaymentPage />
            </CartProvider>
          }
        />
        <Route
          path="/payment/result/:orderId"
          element={
            <CartProvider>
              <PaymentPage showResult />
            </CartProvider>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;