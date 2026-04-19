import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./Student.css";
import ProfilePanel from "./ProfilePanel";

const CATEGORIES = ["Food", "Drink", "Snack", "Dessert", "Other"];

const Student = () => {
  const { getAccessTokenSilently, user: auth0User } = useAuth0();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [activeNav, setActiveNav] = useState("vendors");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [studentProfile, setStudentProfile] = useState(null);

    // Cart count derived from localStorage so the badge stays in sync
  const [cartCount, setCartCount] = useState(() =>
    JSON.parse(localStorage.getItem("cart") || "[]").reduce((sum, i) => sum + i.quantity, 0)
  );

  // Fetch student profile for ProfilePanel
  useEffect(() => {
    if (!auth0User?.sub) return;
    getAccessTokenSilently({
      authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
    })
      .then((token) =>
        fetch(`/api/students/${auth0User.sub}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { 
        if (data) setStudentProfile(data);
        localStorage.setItem("studentId", data._id); })
      .catch(console.error);
  }, [auth0User, getAccessTokenSilently]);

  // Fetch vendors
  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch vendors"); return res.json(); })
      .then((data) => { setVendors(data); setLoadingVendors(false); })
      .catch((err) => { setError(err.message); setLoadingVendors(false); });
  }, []);

  // Fetch menu when vendor selected
  useEffect(() => {
    if (!selectedVendor) return;
    setLoadingMenu(true);
    setMenuItems([]);
    fetch(`/api/menu?vendor=${selectedVendor._id}`)
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch menu"); return res.json(); })
      .then((data) => { setMenuItems(data); setLoadingMenu(false); })
      .catch((err) => { setError(err.message); setLoadingMenu(false); });
  }, [selectedVendor]);

  const filteredItems =
    activeCategory === "All" ? menuItems : menuItems.filter((i) => i.category === activeCategory);

  const handleAddToCart = async (item) => {
    console.log("handleAddToCart called", item);
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i) => i.itemId === item._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        itemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl || null,
        vendorId: selectedVendor._id,
        vendorName: selectedVendor.businessName,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(cart.reduce((sum, i) => sum + i.quantity, 0));

    // 2. Sync to MongoDB so checkout(studentId) can read it
    const studentId = localStorage.getItem("studentId");
    console.log("studentId:", studentId);
    console.log("item:", item);
    console.log("selectedVendor:", selectedVendor);
    console.log("unitPrice being sent:", Number(item.price));

    if (studentId) {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            vendorId: selectedVendor._id,
            menuItem: item._id,       // backend field name
            name: item.name,
            unitPrice: Number(item.price),    // backend field name
            quantity: 1,
            specialNote: "",
          }),
        });
        const result = await res.json();

        // 3. Store cartItemId so Cart.js can update/remove items later
        const serverItem = result.items?.find(
          (si) => si.menuItem?.toString() === item._id?.toString()
        );
        if (serverItem) {
          const updatedCart = JSON.parse(localStorage.getItem("cart") || "[]");
          const local = updatedCart.find((i) => i.itemId === item._id);
          if (local) local.cartItemId = serverItem._id;
          localStorage.setItem("cart", JSON.stringify(updatedCart));
        }
      } catch (err) {
        console.error("Failed to sync item to backend cart:", err);
      }
    }
};

  const handleGoToCart = () => navigate("/cart");

  return (
    <main className="kd-app">
      {/* SIDEBAR */}
      <aside
        className={`kd-sidebar ${expanded ? "expanded" : ""}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <header className="kd-logo">{expanded ? "KuduDash" : "KD"}</header>
        <nav className="kd-nav">
          {[
            { id: "overview", icon: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /></>, label: "Overview" },
            { id: "vendors",  icon: <path d="M4 6h16M4 12h16M4 18h16" />, label: "Vendors" },
            { id: "orders",   icon: <path d="M6 2h12v20H6zM6 6h12" />, label: "Orders" },
            { id: "about",    icon: <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />, label: "About" },
            { id: "settings", icon: <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm8 4a8 8 0 11-16 0 8 8 0 0116 0z" />, label: "Settings" },
          ].map(({ id, icon, label }) => (
            <button key={id} className={`kd-nav-item ${activeNav === id ? "active" : ""}`} onClick={() => setActiveNav(id)}>
              <svg viewBox="0 0 24 24" className="kd-icon">{icon}</svg>
              {expanded && <p className="kd-nav-text">{label}</p>}
            </button>
          ))}

          {/* Cart with badge */}
          <button className="kd-nav-item" onClick={handleGoToCart} style={{ position: "relative" }}>
            <svg viewBox="0 0 24 24" className="kd-icon">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: "6px", right: expanded ? "12px" : "6px",
                background: "#ef4444", color: "#fff", borderRadius: "999px",
                fontSize: "10px", fontWeight: "700", minWidth: "18px", height: "18px",
                display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
              }}>{cartCount}</span>
            )}
            {expanded && <p className="kd-nav-text">Cart</p>}
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <section className="kd-main">
        <header className="kd-topbar">
          <section>
            <h1 className="kd-page-title" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              {activeNav === "vendors" && (selectedVendor ? selectedVendor.businessName : "Vendors")}
              {activeNav === "cart"    && "Cart & Checkout"}
              {activeNav === "orders"  && "My Orders"}
              {activeNav === "overview" && "Overview"}
              {activeNav === "about"   && "About"}
              {activeNav === "settings" && "Settings"}
            </h1>
            <p className="kd-page-sub">
              {activeNav === "vendors" && (selectedVendor ? "Browse items" : "Choose where to order from")}
              {activeNav === "cart"    && "Review your order and place it"}
              {activeNav === "orders"  && "Your order history"}
              {activeNav === "overview" && "Welcome to KuduDash"}
            </p>
          </section>

          {/* ── ProfilePanel replaces the missing avatar ── */}
          <ProfilePanel role="student" user={studentProfile} />
        </header>

        {/* VENDORS PAGE */}
        {activeNav === "vendors" && (
          <>
            {!selectedVendor ? (
              <section className="kd-grid">
                {loadingVendors ? <p className="kd-state-msg">Loading vendors...</p>
                  : error ? <p className="kd-state-msg kd-error">{error}</p>
                  : vendors.length === 0 ? <p className="kd-state-msg">No vendors available.</p>
                  : vendors.map((vendor) => (
                    <article key={vendor._id} className="kd-vendor-card" onClick={() => setSelectedVendor(vendor)}>
                      <header>
                        <figure>
                          {vendor.logo
                            ? <img src={vendor.logo} alt={vendor.businessName} className="kd-vendor-logo" />
                            : <abbr title={vendor.businessName}>{vendor.businessName[0]}</abbr>}
                        </figure>
                        <hgroup><h2>{vendor.businessName}</h2><p><small>{vendor.location}</small></p></hgroup>
                      </header>
                      <p>{vendor.description}</p>
                    </article>
                  ))}
              </section>
            ) : (
              <section className="kd-menu-view">
                <button className="kd-back-btn" onClick={() => { setSelectedVendor(null); setMenuItems([]); setActiveCategory("All"); }}>
                  ← Back
                </button>
                <nav className="kd-category-bar" aria-label="Filter by category">
                  {["All", ...CATEGORIES].map((cat) => {
                    const count = cat === "All" ? menuItems.length : menuItems.filter((i) => i.category === cat).length;
                    return (
                      <button key={cat} className={`kd-category-chip ${activeCategory === cat ? "active" : ""}`}
                        onClick={() => setActiveCategory(cat)} aria-pressed={activeCategory === cat}>
                        {cat}<span className="kd-category-count">{count}</span>
                      </button>
                    );
                  })}
                </nav>
                {loadingMenu && <p className="kd-state-msg">Loading menu...</p>}
                <section className="kd-menu-grid" aria-label="Menu items">
                  {!loadingMenu && filteredItems.length === 0
                    ? <p className="kd-state-msg">No items in this category.</p>
                    : filteredItems.map((item) => (
                      <article key={item._id} className="kd-menu-card">
                        <figure>{item.imageUrl && <img src={item.imageUrl} alt={item.name} className="kd-menu-image" loading="lazy" />}</figure>
                        <section>
                          <h2>{item.name}</h2>
                          <p>{item.description}</p>
                          {item.category && <p><small>{item.category}</small></p>}
                        </section>
                        <footer>
                          <data value={item.price}>R{Number(item.price).toFixed(2)}</data>
                          <button className="kd-btn" onClick={() => handleAddToCart(item)} disabled={item.soldOut}>
                            {item.soldOut ? "Sold Out" : "+ Add"}
                          </button>
                        </footer>
                      </article>
                    ))}
                </section>
              </section>
            )}
          </>
        )}

        {/* ORDERS PAGE */}
        {activeNav === "orders" && (
          <section aria-label="Orders">
            <p className="kd-state-msg">Order history coming soon.</p>
          </section>
        )}

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