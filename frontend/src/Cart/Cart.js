import React, { useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const API_URL = "/api";

// ─── API helpers ────────────────────────────────────────────────────────────

/**
 * POST /api/cart
 * Adds a single item to the student's cart on the server.
 * Maps frontend field names → backend field names.
 */

const syncAddItem = async (studentId, vendorId, item) => {
  await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId,
      vendorId,
      menuItem: item.itemId,       // frontend: itemId  → backend: menuItem
      name: item.name,
      unitPrice: item.price,       // frontend: price   → backend: unitPrice
      quantity: item.quantity,
      specialNote: item.specialNote ?? "",
    }),
  });
};

/**
 * PUT /api/cart/:studentId/items/:cartItemId
 * Updates quantity of a specific line item.
 */
const syncUpdateItem = async (studentId, cartItemId, quantity) => {
  await fetch(`${API_URL}/cart/${studentId}/items/${cartItemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
};

/**
 * DELETE /api/cart/:studentId/items/:cartItemId
 * Removes a single line item.
 */
const syncRemoveItem = async (studentId, cartItemId) => {
  await fetch(`${API_URL}/cart/${studentId}/items/${cartItemId}`, {
    method: "DELETE",
  });
};

/**
 * DELETE /api/cart/:studentId
 * Clears the entire cart.
 */
const syncClearCart = async (studentId) => {
  await fetch(`${API_URL}/cart/${studentId}`, { method: "DELETE" });
};

/**
 * POST /api/orders/checkout
 * Converts the server-side cart into one or more orders.
 * The backend reads the cart from MongoDB — we only need to send studentId.
 */
const placeCheckout = async (studentId) => {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Checkout failed");
  return data; // { success, order }
};

// ─── Component ───────────────────────────────────────────────────────────────

const CartPage = () => {
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [cartStatus, setCartStatus] = useState("active");

  // studentId stored in localStorage when student profile loads in Student.js
  const studentId = localStorage.getItem("studentId");


  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      setCartItems(parsed);
      calculateTotal(parsed);
    }

    // Also fetch cart status from server
  const fetchCartStatus = async () => {
    if (!studentId) return;
    const res = await fetch(`${API_URL}/cart/${studentId}`);
    if (res.ok) {
      const data = await res.json();
      setCartStatus(data.status ?? "active");
    }
  };
  fetchCartStatus();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem("cart", JSON.stringify(cartItems));
    calculateTotal(cartItems);
  }, [cartItems]);

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCartTotal(total);
  };

  // Group cart items by vendor
  const getCartByVendor = () => {
    const grouped = {};
    cartItems.forEach((item) => {
      if (!grouped[item.vendorId]) {
        grouped[item.vendorId] = {
          vendorId: item.vendorId,
          vendorName: item.vendorName,
          items: [],
          subtotal: 0,
        };
      }
      grouped[item.vendorId].items.push(item);
      grouped[item.vendorId].subtotal += item.price * item.quantity;
    });
    return Object.values(grouped);
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    const item = cartItems.find((i) => i.itemId === itemId);
    if (item?.cartItemId && studentId) {
      try {
        await syncUpdateItem(studentId, item.cartItemId, newQuantity);
      } catch (err) {
        console.error("Quantity sync failed:", err);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    const item = cartItems.find((i) => i.itemId === itemId);
    setCartItems((prev) => prev.filter((i) => i.itemId !== itemId));
    if (item?.cartItemId && studentId) {
      try {
        await syncRemoveItem(studentId, item.cartItemId);
      } catch (err) {
        console.error("Remove sync failed:", err);
      }
    }
  };

  const clearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      setCartItems([]);
      localStorage.removeItem("cart");
      if (studentId) {
        try {
          await syncClearCart(studentId);
        } catch (err) {
          console.error("Clear cart sync failed:", err);
        }
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (!studentId) {
      setError("Student session not found. Please log in again.");
      return;
    }

    setIsProcessing(true);
    setError("");
    try {
      const data = await placeCheckout(studentId);
      localStorage.removeItem("cart")

      
      navigate(`/payment/${data.order._id}`, {
        state: { allOrders: [data.order] },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const cartByVendor = getCartByVendor();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasMultipleVendors = cartByVendor.length > 1;

  return (
    <main className="kd-app">
      {/* SIDEBAR */}
      <aside
        className={`kd-sidebar ${expanded ? "expanded" : ""}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <header className="kd-logo">
          {expanded ? "KuduDash" : "KD"}
        </header>

        <nav className="kd-nav">
          <button className="kd-nav-item">
            <svg viewBox="0 0 24 24" className="kd-icon">
              <rect x="3" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="14" width="7" height="7" rx="2" />
              <rect x="3" y="14" width="7" height="7" rx="2" />
            </svg>
            {expanded && <p className="kd-nav-text">Overview</p>}
          </button>

          <button className="kd-nav-item" onClick={() => navigate("/dashboard/student")}>
            <svg viewBox="0 0 24 24" className="kd-icon">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {expanded && <p className="kd-nav-text">Vendors</p>}
          </button>

          <button className="kd-nav-item" >
            <svg viewBox="0 0 24 24" className="kd-icon">
              <path d="M6 2h12v20H6zM6 6h12" />
            </svg>
            {expanded && <p className="kd-nav-text">Orders</p>}
          </button>

          <button className="kd-nav-item">
            <svg viewBox="0 0 24 24" className="kd-icon">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            {expanded && <p className="kd-nav-text">About</p>}
          </button>

          <button className="kd-nav-item">
            <svg viewBox="0 0 24 24" className="kd-icon">
              <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm8 4a8 8 0 11-16 0 8 8 0 0116 0z" />
            </svg>
            {expanded && <p className="kd-nav-text">Settings</p>}
          </button>

          <button className="kd-nav-item" style={{ position: "relative" }}>
            <svg viewBox="0 0 24 24" className="kd-icon">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {itemCount > 0 && (
              <span style={{
                position: "absolute", top: "6px", right: expanded ? "12px" : "6px",
                background: "#ef4444", color: "#fff", borderRadius: "999px",
                fontSize: "10px", fontWeight: "700", minWidth: "18px", height: "18px",
                display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
              }}>{itemCount}</span>
            )}
            {expanded && <p className="kd-nav-text">Cart</p>}
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <section className="kd-main">
        <header className="kd-topbar">
          <section>
            <h1 className="kd-page-title" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              Cart & Checkout
            </h1>
            <p className="kd-page-sub">Review your order and place it</p>
          </section>
          <figure className="kd-avatar" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            KD
          </figure>
        </header>

        {cartItems.length === 0 ? (
          /* EMPTY CART STATE */
          <section className="kd-empty-cart">
            <figure className="kd-empty-cart-icon">🛒</figure>
            <p className="kd-empty-cart-message">Your cart is empty</p>
            <button className="kd-empty-cart-btn" onClick={() => navigate("/dashboard/student")}>
              Browse Menus
            </button>
          </section>
        ) : (
           <section className="kd-checkout-grid">
            {/* LEFT — Order Summary with editable quantities */}
            <section className="kd-order-summary">
              <h2 className="kd-summary-title">Order Summary</h2>
 
              {hasMultipleVendors && (
                <aside className="kd-multi-vendor-warning">
                  <span className="kd-warning-icon">⚠️</span>
                  <span className="kd-warning-text">
                    Items from {cartByVendor.length} vendors — a separate order will be placed for each.
                  </span>
                </aside>
              )}
 
            {/* CART ITEMS GROUPED BY VENDOR */}
            {cartByVendor.map((vendorCart) => (
              <article key={vendorCart.vendorId} className="kd-cart-vendor-section">
                <h3 className="kd-cart-checkout-vendor-name">{vendorCart.vendorName}</h3>

                {vendorCart.items.map((item) => (
                  <section key={item.itemId} className="kd-checkout-item">
                    <figure className="kd-cart-item-info">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="kd-cart-item-image"
                        />
                      )}
                      <figcaption className="kd-cart-item-details">
                        <strong className="kd-checkout-item-name">{item.name}</strong>
                        <span className="kd-cart-item-price">
                          R{item.price.toFixed(2)} each
                        </span>
                      </figcaption>
                    </figure>

                    <nav className="kd-cart-quantity">
                      <button
                        className="kd-quantity-btn"
                        onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                      >−</button>
                      <span className="kd-quantity-value">{item.quantity}</span>
                      <button
                        className="kd-quantity-btn"
                        onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                      >+</button>
                    </nav>

                    <output className="kd-cart-item-subtotal">
                      R{(item.price * item.quantity).toFixed(2)}
                    </output>

                    <button
                      className="kd-remove-btn"
                      onClick={() => removeFromCart(item.itemId)}
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </section>
                ))}

                <footer className="kd-vendor-subtotal">
                  <span>Subtotal:</span>
                  <span>R{vendorCart.subtotal.toFixed(2)}</span>
                </footer>
              </article>
            ))}

            <button className="kd-clear-cart-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </section>

          {/* RIGHT — Payment Summary + Place Order */}
            <aside className="kd-payment-panel">
              <h2 className="kd-payment-title">Payment Summary</h2>
 
              <section className="kd-payment-row">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <span>R{cartTotal.toFixed(2)}</span>
              </section>
              <section className="kd-payment-row">
                <span>Delivery Fee</span>
                <span>R0.00</span>
              </section>
              <section className="kd-payment-row">
                <span>Service Fee</span>
                <span>R0.00</span>
              </section>
              <footer className="kd-payment-row total">
                <span>Total</span>
                <span>R{cartTotal.toFixed(2)}</span>
              </footer>
 
              {hasMultipleVendors && (
                <aside className="kd-info-message">
                  🛒 {cartByVendor.length} separate orders will be placed.
                </aside>
              )}
 
              {error && <aside className="kd-error-message">{error}</aside>}
 
              <button
                className="kd-place-order-btn"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing
                  ? "Processing..."
                  : `Place ${cartByVendor.length > 1 ? `${cartByVendor.length} Orders` : "Order"} →`}
              </button>
 
              <button
                className="kd-btn ghost"
                style={{ width: "100%", marginTop: "8px" }}
                onClick={() => navigate("/dashboard/student")}
              >
                ← Continue Shopping
              </button>
            </aside>
 
          </section>
        )}
      </section>
    </main>
  );
};

export default CartPage;