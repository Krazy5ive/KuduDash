import React, { useState, useEffect } from "react";
import { useCart } from "../Cart/CartContext";
import { useAuth0 } from "@auth0/auth0-react";
import "./Student.css";

const CATEGORIES = ["Food", "Drink", "Snack", "Dessert", "Other"];

const Student = () => {
  const { cartItems, cartTotal, cartCount, addToCart, removeFromCart, updateQuantity, clearCart, getCartByVendor } = useCart();
  const { getAccessTokenSilently } = useAuth0();

  const [expanded, setExpanded] = useState(false);
  const [activeNav, setActiveNav] = useState("vendors");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  // Checkout state
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  // fetch vendors
  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch vendors");
        return res.json();
      })
      .then((data) => {
        setVendors(data);
        setLoadingVendors(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingVendors(false);
      });
  }, []);

  // fetch menu when vendor is selected
  useEffect(() => {
    if (!selectedVendor) return;
    setLoadingMenu(true);
    setMenuItems([]);

    fetch(`/api/menu?vendor=${selectedVendor._id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch menu");
        return res.json();
      })
      .then((data) => {
        setMenuItems(data);
        setLoadingMenu(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingMenu(false);
      });
  }, [selectedVendor]);

  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  const handleAddToCart = (item) => {
    if (!selectedVendor) return;
    addToCart(item, selectedVendor._id, selectedVendor.businessName);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setCheckoutError("");

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });

      const cartByVendor = getCartByVendor();
      const firstVendor = cartByVendor[0];

      const orderData = {
        vendorId: firstVendor.vendorId,
        items: firstVendor.items.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        totalAmount: firstVendor.subtotal,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order");
      }

      const data = await response.json();
      clearCart();
      setOrderSuccess(data.order);
      setActiveNav("orders");

    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const cartByVendor = getCartByVendor();
  const hasMultipleVendors = cartByVendor.length > 1;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
          <button
            className={`kd-nav-item ${activeNav === "overview" ? "active" : ""}`}
            onClick={() => setActiveNav("overview")}
          >
            <svg viewBox="0 0 24 24" className="kd-icon">
              <rect x="3" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="14" width="7" height="7" rx="2" />
              <rect x="3" y="14" width="7" height="7" rx="2" />
            </svg>
            {expanded && <p className="kd-nav-text">Overview</p>}
          </button>

          <button
            className={`kd-nav-item ${activeNav === "vendors" ? "active" : ""}`}
            onClick={() => setActiveNav("vendors")}
          >
            <svg viewBox="0 0 24 24" className="kd-icon">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {expanded && <p className="kd-nav-text">Vendors</p>}
          </button>

          <button
            className={`kd-nav-item ${activeNav === "cart" ? "active" : ""}`}
            onClick={() => setActiveNav("cart")}
            style={{ position: "relative" }}
          >
            <svg viewBox="0 0 24 24" className="kd-icon">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: "absolute",
                top: "6px",
                right: expanded ? "12px" : "6px",
                background: "#ef4444",
                color: "#fff",
                borderRadius: "999px",
                fontSize: "10px",
                fontWeight: "700",
                minWidth: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}>
                {cartCount}
              </span>
            )}
            {expanded && <p className="kd-nav-text">Cart</p>}
          </button>

          <button
            className={`kd-nav-item ${activeNav === "orders" ? "active" : ""}`}
            onClick={() => setActiveNav("orders")}
          >
            <svg viewBox="0 0 24 24" className="kd-icon">
              <path d="M6 2h12v20H6zM6 6h12" />
            </svg>
            {expanded && <p className="kd-nav-text">Orders</p>}
          </button>

          <button
            className={`kd-nav-item ${activeNav === "about" ? "active" : ""}`}
            onClick={() => setActiveNav("about")}
          >
            <svg viewBox="0 0 24 24" className="kd-icon">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            {expanded && <p className="kd-nav-text">About</p>}
          </button>

          <button
            className={`kd-nav-item ${activeNav === "settings" ? "active" : ""}`}
            onClick={() => setActiveNav("settings")}
          >
            <svg viewBox="0 0 24 24" className="kd-icon">
              <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm8 4a8 8 0 11-16 0 8 8 0 0116 0z" />
            </svg>
            {expanded && <p className="kd-nav-text">Settings</p>}
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <section className="kd-main">
        <header className="kd-topbar">
          <section>
            <h1 className="kd-page-title" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              {activeNav === "vendors" && (selectedVendor ? selectedVendor.businessName : "Vendors")}
              {activeNav === "cart" && "Cart & Checkout"}
              {activeNav === "orders" && "My Orders"}
              {activeNav === "overview" && "Overview"}
              {activeNav === "about" && "About"}
              {activeNav === "settings" && "Settings"}
            </h1>
            <p className="kd-page-sub">
              {activeNav === "vendors" && (selectedVendor ? "Browse items" : "Choose where to order from")}
              {activeNav === "cart" && "Review your order and place it"}
              {activeNav === "orders" && "Your order history"}
              {activeNav === "overview" && "Welcome to KuduDash"}
              {activeNav === "about" && ""}
              {activeNav === "settings" && ""}
            </p>
          </section>
        </header>

        {/* ── VENDORS PAGE ── */}
        {activeNav === "vendors" && (
          <>
            {!selectedVendor ? (
              <section className="kd-grid">
                {loadingVendors ? (
                  <p className="kd-state-msg">Loading vendors...</p>
                ) : error ? (
                  <p className="kd-state-msg kd-error">{error}</p>
                ) : vendors.length === 0 ? (
                  <p className="kd-state-msg">No vendors available.</p>
                ) : (
                  vendors.map((vendor) => (
                    <article
                      key={vendor._id}
                      className="kd-vendor-card"
                      onClick={() => setSelectedVendor(vendor)}
                    >
                      <header>
                        <figure>
                          {vendor.logo
                            ? <img src={vendor.logo} alt={vendor.businessName} className="kd-vendor-logo" />
                            : <abbr title={vendor.businessName}>{vendor.businessName[0]}</abbr>
                          }
                        </figure>
                        <hgroup>
                          <h2>{vendor.businessName}</h2>
                          <p><small>{vendor.location}</small></p>
                        </hgroup>
                      </header>
                      <p>{vendor.description}</p>
                    </article>
                  ))
                )}
              </section>
            ) : (
              <section className="kd-menu-view">
                <button
                  className="kd-back-btn"
                  onClick={() => {
                    setSelectedVendor(null);
                    setMenuItems([]);
                    setActiveCategory("All");
                  }}
                >
                  ← Back
                </button>

                <nav className="kd-category-bar" aria-label="Filter by category">
                  {["All", ...CATEGORIES].map((cat) => {
                    const count =
                      cat === "All"
                        ? menuItems.length
                        : menuItems.filter((i) => i.category === cat).length;
                    return (
                      <button
                        key={cat}
                        className={`kd-category-chip ${activeCategory === cat ? "active" : ""}`}
                        onClick={() => setActiveCategory(cat)}
                        aria-pressed={activeCategory === cat}
                      >
                        {cat}
                        <output className="kd-category-count">{count}</output>
                      </button>
                    );
                  })}
                </nav>

                {loadingMenu && <p className="kd-state-msg">Loading menu...</p>}

                <section className="kd-menu-grid" aria-label="Menu items">
                  {!loadingMenu && filteredItems.length === 0 ? (
                    <p className="kd-state-msg">No items in this category.</p>
                  ) : (
                    filteredItems.map((item) => (
                      <article key={item._id} className="kd-menu-card">
                        <figure>
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt={item.name} className="kd-menu-image" loading="lazy" />
                            : null
                          }
                        </figure>
                        <section>
                          <h2>{item.name}</h2>
                          <p>{item.description}</p>
                          {item.category && <p><small>{item.category}</small></p>}
                        </section>
                        <footer>
                          <data value={item.price}>R{Number(item.price).toFixed(2)}</data>
                          <button
                            className="kd-btn"
                            onClick={() => handleAddToCart(item)}
                            disabled={item.soldOut}
                          >
                            {item.soldOut ? "Sold Out" : "+ Add"}
                          </button>
                        </footer>
                      </article>
                    ))
                  )}
                </section>
              </section>
            )}
          </>
        )}

        {/* ── CART & CHECKOUT PAGE ── */}
        {activeNav === "cart" && (
          <section className="kd-checkout-view">
            {cartItems.length === 0 ? (
              <div className="kd-empty-state" role="status">
                <svg className="kd-empty-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <p>Your cart is empty.</p>
                <button className="kd-btn primary" onClick={() => setActiveNav("vendors")}>
                  Browse Vendors
                </button>
              </div>
            ) : (
              <section className="kd-checkout-grid">
                {/* LEFT — ORDER SUMMARY */}
                <section className="kd-order-summary">
                  <h2 className="kd-summary-title">Order Summary</h2>

                  {hasMultipleVendors && (
                    <aside className="kd-multi-vendor-warning">
                      <span>⚠️</span>
                      <span>Your cart has items from multiple vendors. Only the first vendor's items will be ordered.</span>
                    </aside>
                  )}

                  {cartByVendor.map((vendorCart) => (
                    <article key={vendorCart.vendorId} className="kd-vendor-checkout-section">
                      <h3 className="kd-vendor-checkout-name">{vendorCart.vendorName}</h3>

                      {vendorCart.items.map((item) => (
                        <section key={item.itemId} className="kd-checkout-item">
                          <p className="kd-checkout-item-name">
                            <span className="kd-checkout-item-quantity">{item.quantity}×</span>
                            <span>{item.name}</span>
                          </p>
                          <section className="kd-checkout-item-controls">
                            <button
                              className="kd-qty-btn"
                              onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                            >−</button>
                            <span>{item.quantity}</span>
                            <button
                              className="kd-qty-btn"
                              onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                            >+</button>
                            <button
                              className="kd-remove-btn"
                              onClick={() => removeFromCart(item.itemId)}
                            >🗑</button>
                            <output>R{(item.price * item.quantity).toFixed(2)}</output>
                          </section>
                        </section>
                      ))}

                      <footer className="kd-vendor-checkout-subtotal">
                        <span>Subtotal</span>
                        <span>R{vendorCart.subtotal.toFixed(2)}</span>
                      </footer>
                    </article>
                  ))}

                  <button
                    className="kd-btn danger"
                    style={{ marginTop: "16px" }}
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                </section>

                {/* RIGHT — PAYMENT PANEL */}
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

                  {checkoutError && (
                    <aside className="kd-error-message">{checkoutError}</aside>
                  )}

                  <button
                    className="kd-place-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Place Order →"}
                  </button>

                  <button
                    className="kd-btn ghost"
                    style={{ width: "100%", marginTop: "8px" }}
                    onClick={() => setActiveNav("vendors")}
                  >
                    ← Continue Shopping
                  </button>
                </aside>
              </section>
            )}
          </section>
        )}

        {/* ── ORDERS PAGE ── */}
        {activeNav === "orders" && (
          <section aria-label="Orders">
            {orderSuccess && (
              <aside className="kd-success-banner">
                ✅ Order placed successfully! Order ID: <strong>{orderSuccess._id}</strong>
              </aside>
            )}
            <p className="kd-state-msg">Order history coming soon.</p>
          </section>
        )}

        {/* ── PLACEHOLDERS ── */}
        {(activeNav === "overview" || activeNav === "about" || activeNav === "settings") && (
          <section>
            <p style={{ color: "#475569", fontSize: "14px" }}>
              The <strong>{activeNav}</strong> section is not yet implemented.
            </p>
          </section>
        )}
      </section>
    </main>
  );
};

export default Student;