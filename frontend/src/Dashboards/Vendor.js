// Dashboards/Vendor.js
import React, { useState, useRef, useEffect } from "react";
import "./Vendor.css";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ProfilePanel from "./ProfilePanel";
import OrderManagement from "./OrderManagement";
import VendorReviews from "../VendorReviews";
import API_BASE_URL from '../api';

const CATEGORIES = ["Food", "Drink", "Snack", "Dessert", "Other"];

// FALCPA / SA R638 Big 9 allergens
const ALLERGENS = [
  "milk", "eggs", "fish", "shellfish",
  "tree nuts", "peanuts", "wheat", "soy", "sesame",
];

const DIETARY_TAGS = ["halal", "vegetarian", "vegan", "dairy-free"];

// Colour map for allergen badges on the card
const ALLERGEN_COLOURS = {
  milk:         { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  text: "#fbbf24" },
  eggs:         { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  text: "#fbbf24" },
  fish:         { bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.3)",  text: "#818cf8" },
  shellfish:    { bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.3)",  text: "#818cf8" },
  "tree nuts":  { bg: "rgba(234,179,8,0.12)",   border: "rgba(234,179,8,0.3)",   text: "#ca8a04" },
  peanuts:      { bg: "rgba(234,179,8,0.12)",   border: "rgba(234,179,8,0.3)",   text: "#ca8a04" },
  wheat:        { bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.3)",  text: "#fb923c" },
  soy:          { bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.3)",  text: "#fb923c" },
  sesame:       { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   text: "#f87171" },
};

const DIETARY_COLOURS = {
  halal:       { bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)",  text: "#4ade80" },
  vegetarian:  { bg: "rgba(110,231,183,0.12)",border: "rgba(110,231,183,0.3)",text: "#6ee7b7" },
  vegan:       { bg: "rgba(110,231,183,0.12)",border: "rgba(110,231,183,0.3)",text: "#6ee7b7" },
  "dairy-free":{ bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.3)", text: "#38bdf8" },
};
const EMPTY_FORM = {
  name: "",
  description: "",
  priceCents: 0,
  category: "Food",
  imageUrl: "",
  allergens: [],
  dietaryTags: [],
};

const Vendor = () => {
  const { getAccessTokenSilently, logout } = useAuth0();
  const location = useLocation();
  const vendorId = location.state?.vendorId || "";

  const [expanded,        setExpanded]        = useState(false);
  const [activeNav,       setActiveNav]        = useState("menu");
  const [menuItems,       setMenuItems]        = useState([]);
  const [vendorProfile,   setVendorProfile]    = useState(null);

  const [modal,           setModal]            = useState(null);
  const [formData,        setFormData]         = useState(EMPTY_FORM);
  const [editingId,       setEditingId]        = useState(null);
  const [pendingDeleteId, setPendingDeleteId]  = useState(null);
  const [formError,       setFormError]        = useState("");

  const [isSuspended,     setIsSuspended]      = useState(false);

  const [appealMessage, setAppealMessage] = useState("");
  const [appealState,   setAppealState]   = useState("idle");
  const [appealError,   setAppealError]   = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMenuItems();
    fetchVendorProfile().then((suspended) => {
      if (suspended) fetchExistingAppeal();
    });
  }, []);

  const getToken = () =>
    getAccessTokenSilently({
      authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
    });

  // ── Data fetchers ────────────────────────────────────────────────────

  const fetchVendorProfile = async () => {
    if (!vendorId) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/vendors/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch vendor profile");
      const data = await res.json();
      setVendorProfile(data);
      if (data.status === "suspended"){
        setIsSuspended(true);
        return true;
      } 
    } catch (err) {
      console.error("Error fetching vendor profile:", err);
    }
  };

  const fetchMenuItems = async () => {
    if (!vendorId) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/menu-items/vendor/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMenuItems(data.map((item) => ({ ...item, id: item._id })));
    } catch (err) {
      console.error("Error fetching menu items:", err);
    }
  };

  const fetchExistingAppeal = async () => {
    if (!vendorId) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/appeals/vendor/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.status === "pending") setAppealState("duplicate");
    } catch (err) {
      console.error("Error checking existing appeal:", err);
    }
  };

  // ── Profile update handler ───────────────────────────────────────────

  const handleProfileUpdate = async (formData) => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/api/vendors/${vendorId}/profile`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Update failed");
    }
    const updated = await res.json();
    setVendorProfile(updated);
  };

  // ── Sold-out toggle ──────────────────────────────────────────────────

  const handleToggleSoldOut = async (item) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/menu-items/${item.id}/sold-out`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to update availability");
      // Flip immediately in local state — no need to re-fetch the whole list
      setMenuItems((prev) =>
        prev.map((m) => m.id === item.id ? { ...m, isSoldOut: !m.isSoldOut } : m)
      );
    } catch (err) {
      console.error("Error toggling sold out:", err);
    }
  };

 // ── Checkbox helpers ─────────────────────────────────────────────────

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  // ── Menu modal helpers ───────────────────────────────────────────────

  const openAddModal = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
    setModal("add");
  };

  const openEditModal = (item) => {
    setFormData({
      name:        item.name        || "",
      description: item.description || "",
      priceCents:  Math.round((Number(item.price) || 0) * 100),
      category:    item.category    || "Food",
      imageUrl:    item.imageUrl    || "",
      allergens:   item.allergens   || [],
      dietaryTags: item.dietaryTags || [],
    });
    setEditingId(item.id);
    setFormError("");
    setModal("edit");
  };

  const openDeleteModal = (id) => {
    setPendingDeleteId(id);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
    setPendingDeleteId(null);
    setFormError("");
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceKeyDown = (e) => {
    const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight"];
    if (allowed.includes(e.key)) {
      if (e.key === "Backspace") {
        e.preventDefault();
        setFormData((prev) => ({ ...prev, priceCents: Math.floor(prev.priceCents / 10) }));
      }
      return;
    }
    if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }
    e.preventDefault();
    setFormData((prev) => ({ ...prev, priceCents: prev.priceCents * 10 + parseInt(e.key, 10) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFormData((prev) => ({ ...prev, imageUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const token = await getToken();
      const { priceCents, ...rest } = formData;
      const res = await fetch(`${API_BASE_URL}/api/menu-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...rest, price: priceCents / 100, vendor: vendorId }),
      });
      if (!res.ok) { const data = await res.json(); setFormError(data.message || "Something went wrong"); return; }
      await fetchMenuItems();
      closeModal();
    } catch (err) {
      console.error("Error adding menu item:", err);
      setFormError("Something went wrong. Please try again.");
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const token = await getToken();
      const { priceCents, ...rest } = formData;
      const res = await fetch(`${API_BASE_URL}/api/menu-items/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...rest, price: priceCents / 100 }),
      });
      if (!res.ok) { const data = await res.json(); setFormError(data.message || "Something went wrong"); return; }
      await fetchMenuItems();
      closeModal();
    } catch (err) {
      console.error("Error updating menu item:", err);
      setFormError("Something went wrong. Please try again.");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/menu-items/${pendingDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchMenuItems();
      closeModal();
    } catch (err) {
      console.error("Error deleting menu item:", err);
    }
  };

  const pendingDeleteItem = menuItems.find((item) => item.id === pendingDeleteId);

    /* ── Checkbox group component ── */
  const renderCheckboxGroup = (label, field, options, colourMap) => (
    <section className="kd-field">
      <span className="kd-label">{label}</span>
      <div className="kd-checkbox-grid">
        {options.map((opt) => {
          const checked = (formData[field] || []).includes(opt);
          const colours = colourMap[opt];
          return (
            <label
              key={opt}
              className={`kd-checkbox-chip ${checked ? "checked" : ""}`}
              style={checked && colours ? {
                background: colours.bg,
                borderColor: colours.border,
                color: colours.text,
              } : {}}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleCheckboxChange(field, opt)}
              />
              {opt}
            </label>
          );
        })}
      </div>
    </section>
  );

  // ── submitting appeal ───────────────────────────────────────────────
  const handleSubmitAppeal = async () => {
    if (!appealMessage.trim()) return;
    setAppealState("pending");
    setAppealError("");
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/appeals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vendorId, message: appealMessage }),
      });
      if (res.status === 409) { setAppealState("duplicate"); return; }
      if (!res.ok) {
        const data = await res.json();
        setAppealError(data.message || "Something went wrong. Please try again.");
        setAppealState("idle");
        return;
      }
      setAppealState("submitted");
    } catch (err) {
      console.error("Appeal submission error:", err);
      setAppealError("Something went wrong. Please try again.");
      setAppealState("idle");
    }
  };

  /* ── Shared form markup ── */
  const renderForm = (onSubmit) => (
    <form className="kd-form" onSubmit={onSubmit} noValidate>
      <fieldset style={{ border: "none", display: "contents" }}>
        <legend className="kd-modal-title">
          {modal === "add" ? "Add menu item" : "Edit menu item"}
        </legend>

        {formError && <p className="kd-form-error" role="alert">{formError}</p>}

        <section className="kd-field">
          <label className="kd-label" htmlFor="item-name">Name</label>
          <input id="item-name" className="kd-input" type="text" name="name"
            value={formData.name} onChange={handleFieldChange}
            placeholder="e.g. Mango Smoothie" required autoComplete="off" />
        </section>

        <section className="kd-field">
          <label className="kd-label" htmlFor="item-description">Description</label>
          <textarea id="item-description" className="kd-textarea" name="description"
            value={formData.description} onChange={handleFieldChange}
            placeholder="A short description of the item…" />
        </section>

        <section className="kd-field">
          <label className="kd-label" htmlFor="item-price">Price (R)</label>
          <input id="item-price" className="kd-input" type="text" inputMode="numeric" name="price"
            value={(formData.priceCents / 100).toFixed(2)}
            onKeyDown={handlePriceKeyDown} onChange={() => {}} placeholder="0.00" required />
        </section>

        <section className="kd-field">
          <label className="kd-label" htmlFor="item-category">Category</label>
          <select id="item-category" className="kd-select" name="category"
            value={formData.category} onChange={handleFieldChange}>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </section>

        {/* ── Allergens (FALCPA / SA R638) ── */}
        {renderCheckboxGroup("Contains allergens", "allergens", ALLERGENS, ALLERGEN_COLOURS)}

        {/* ── Dietary tags ── */}
        {renderCheckboxGroup("Dietary info", "dietaryTags", DIETARY_TAGS, DIETARY_COLOURS)}

        <section className="kd-field">
          <label className="kd-label" htmlFor="item-image">Photo</label>
          <label className="kd-upload-area" htmlFor="item-image">
            {formData.imageUrl ? (
              <img src={formData.imageUrl} alt="Preview" className="kd-upload-preview" />
            ) : (
              <>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 16l4-4 4 4 4-6 4 6" />
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                </svg>
                <p>Click to upload a photo</p>
                <small className="kd-upload-hint">PNG, JPG or WEBP — max 5 MB</small>
              </>
            )}
          </label>
          <input id="item-image" className="kd-file-input" type="file" accept="image/*"
            ref={fileInputRef} onChange={handleImageChange} />
        </section>

        <footer className="kd-form-footer">
          <button type="button" className="kd-btn ghost" onClick={closeModal}>Cancel</button>
          <button type="submit" className="kd-btn primary">
            {modal === "add" ? "Add item" : "Save changes"}
          </button>
        </footer>
      </fieldset>
    </form>
  );

  /* ── Render ── */
  return (
    <main className="kd-app">

      {isSuspended && (
        <section
          className="kd-modal-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="suspended-title"
          style={{ zIndex: 9999 }}
        >
          <article className="kd-modal" style={{ maxWidth: 480, padding: "36px 40px" }}>

            {/* Icon */}
            <section style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "var(--color-background-danger, rgba(239,68,68,0.12))",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none"
                stroke="var(--kd-red, #ef4444)" strokeWidth={2} strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </section>

            {/* Title */}
            <h2 className="kd-modal-title" id="suspended-title"
              style={{ textAlign: "center", marginBottom: 3}}>
              Account suspended
            </h2>

            {/* Reason badge */}
            {vendorProfile?.statusReason && (
              <p style={{
                textAlign: "center", fontSize: 13,
                color: "var(--color-text-secondary)",
                marginBottom: 3,
              }}>
                Reason: <strong style={{ color: "var(--color-text-primary)" }}>
                  {vendorProfile.statusReason}
                </strong>
              </p>
            )}

            <hr style={{ border: "none", borderTop: "1px solid var(--color-border-secondary)", marginBottom: 4 }} />

            {/* idle — show form */}
            {appealState === "idle" && (
              <>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
                  If you believe this suspension is a mistake, you can submit an appeal below.
                  Our team will review it and get back to you.
                </p>

                <section style={{ marginBottom: 12 }}>
                  <label style={{
                    display: "block", fontSize: 12, fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    marginBottom: 8,
                  }}>
                    Your appeal message
                  </label>
                  <textarea
                    className="kd-textarea"
                    placeholder="Explain why you believe this suspension should be reversed…"
                    value={appealMessage}
                    onChange={(e) => setAppealMessage(e.target.value)}
                    maxLength={1000}
                    rows={5}
                  />
                  <p style={{
                    fontSize: 11, color: "var(--color-text-secondary)",
                    textAlign: "right", marginTop: 4,
                  }}>
                    {appealMessage.length}/1000
                  </p>
                </section>

                {appealError && (
                  <p className="kd-form-error" role="alert" style={{ marginBottom: 16 }}>
                    {appealError}
                  </p>
                )}

                <footer style={{
                  display: "flex", flexDirection: "column", gap: 10, marginTop: 8,
                }}>
                  <button
                    className="kd-btn primary"
                    onClick={handleSubmitAppeal}
                    disabled={!appealMessage.trim()}
                    style={{ width: "100%" }}
                  >
                    Submit appeal
                  </button>
                  <button
                    className="kd-btn ghost"
                    onClick={() => logout({ returnTo: window.location.origin })}
                    style={{ width: "100%" }}
                  >
                    Sign out
                  </button>
                </footer>
              </>
            )}

            {/* pending — submitting */}
            {appealState === "pending" && (
              <p style={{ textAlign: "center", fontSize: 13, color: "var(--color-text-secondary)" }}>
                Submitting your appeal…
              </p>
            )}

            {/* submitted — success */}
            {appealState === "submitted" && (
              <>
                <section style={{
                  background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: 10, padding: "16px 18px", marginBottom: 24, textAlign: "center",
                }}>
                  <p style={{ fontSize: 20, marginBottom: 6 }}>✓</p>
                  <p style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.6 }}>
                    Your appeal has been submitted. Check your email for a confirmation.
                    Our team will be in touch soon.
                  </p>
                </section>
                <button
                  className="kd-btn ghost"
                  onClick={() => logout({ returnTo: window.location.origin })}
                  style={{ width: "100%" }}
                >
                  Sign out
                </button>
              </>
            )}

            {/* duplicate — already pending */}
            {appealState === "duplicate" && (
              <>
                <section style={{
                  background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)",
                  borderRadius: 10, padding: "16px 18px", marginBottom: 24, textAlign: "center",
                }}>
                  <p style={{ fontSize: 20, marginBottom: 6 }}>⏳</p>
                  <p style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.6 }}>
                    You already have a pending appeal. Our team will review it and get back to you shortly.
                  </p>
                </section>
                <button
                  className="kd-btn ghost"
                  onClick={() => logout({ returnTo: window.location.origin })}
                  style={{ width: "100%" }}
                >
                  Sign out
                </button>
              </>
            )}

          </article>
        </section>
      )}

      {/* SIDEBAR */}
      <aside
        className={`kd-sidebar ${expanded ? "expanded" : ""}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        aria-label="Vendor navigation"
      >
        <header className="kd-logo" aria-label="KuduDash vendor portal">
          {expanded ? "KuduDash" : "KD"}
        </header>
        <nav className="kd-nav" aria-label="Main menu">
          <ul>
            <li>
              <button className={`kd-nav-item ${activeNav === "menu" ? "active" : ""}`}
                onClick={() => setActiveNav("menu")} aria-current={activeNav === "menu" ? "page" : undefined}>
                <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                {expanded && <p className="kd-nav-text">Menu</p>}
              </button>
            </li>
            <li>
              <button className={`kd-nav-item ${activeNav === "orders" ? "active" : ""}`}
                onClick={() => setActiveNav("orders")} aria-current={activeNav === "orders" ? "page" : undefined}>
                <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true"><path d="M6 2h12v20H6zM6 6h12" /></svg>
                {expanded && <p className="kd-nav-text">Orders</p>}
              </button>
            </li>
            <li>
              <button className={`kd-nav-item ${activeNav === "reviews" ? "active" : ""}`}
                onClick={() => setActiveNav("reviews")} aria-current={activeNav === "reviews" ? "page" : undefined}>
                <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {expanded && <p className="kd-nav-text">Reviews</p>}
              </button>
            </li>
            <li>
              <button className={`kd-nav-item ${activeNav === "customers" ? "active" : ""}`}
                onClick={() => setActiveNav("customers")} aria-current={activeNav === "customers" ? "page" : undefined}>
                <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true">
                  <circle cx="9" cy="7" r="4" /><path d="M2 21c0-4 3.1-7 7-7h4c3.9 0 7 3 7 7" /><circle cx="19" cy="9" r="3" />
                </svg>
                {expanded && <p className="kd-nav-text">Customers</p>}
              </button>
            </li>
            <li>
              <button className={`kd-nav-item ${activeNav === "reports" ? "active" : ""}`}
                onClick={() => setActiveNav("reports")} aria-current={activeNav === "reports" ? "page" : undefined}>
                <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true"><path d="M4 20V10M9 20V4M14 20v-6M19 20v-9" /></svg>
                {expanded && <p className="kd-nav-text">Reports</p>}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <section className="kd-main">

        {/* TOP BAR */}
        <header className="kd-topbar">
          <section>
            <h1 className="kd-page-title">
              {activeNav === "orders"  ? "Orders"
                : activeNav === "reviews" ? "Reviews"
                : activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
            </h1>
            <p className="kd-page-sub">
              {activeNav === "menu"     ? "Manage what you sell"
                : activeNav === "orders"  ? "Manage and advance customer orders"
                : activeNav === "reviews" ? "See what your customers are saying"
                : "Coming soon"}
            </p>
          </section>

          <ProfilePanel
            role="vendor"
            user={vendorProfile}
            onUpdate={handleProfileUpdate}
          />
        </header>

        {/* MENU PAGE */}
        {activeNav === "menu" && (
          <section aria-label="Menu management">
            <header className="kd-menu-toprow">
              <h2 className="kd-section-title">Your items ({menuItems.length})</h2>
              <button className="kd-btn primary" onClick={openAddModal}>+ Add item</button>
            </header>

            <ul className="kd-menu-grid" aria-label="Menu items list">
              {menuItems.length === 0 && (
                <li className="kd-empty-state" role="status">
                  <svg className="kd-empty-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 4v16M4 12h16" /><circle cx="12" cy="12" r="9" />
                  </svg>
                  <p>No items yet — add your first one!</p>
                </li>
              )}
              {menuItems.map((item) => (
                <li key={item.id} className={`kd-item-card ${item.isSoldOut ? "kd-item-card--sold-out" : ""}`}>

                  {/* Image or placeholder — with sold-out overlay when applicable */}
                  <div className="kd-item-image-wrap">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="kd-item-image" />
                    ) : (
                      <figure className="kd-item-image-placeholder" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d="M4 16l4-4 4 4 4-6 4 6" /><rect x="3" y="3" width="18" height="18" rx="3" /></svg>
                      </figure>
                    )}
                    {item.isSoldOut && (
                      <span className="kd-sold-out-badge" aria-label="Sold out">Sold Out</span>
                    )}
                  </div>

                  <section className="kd-item-body">
                    <p className="kd-item-category">{item.category}</p>
                    <h3 className="kd-item-name">{item.name}</h3>
                    {item.description && <p className="kd-item-description">{item.description}</p>}
                    <p className="kd-item-price">R{Number(item.price).toFixed(2)}</p>
                    
                    {/* Dietary tag badges */}
                    {item.dietaryTags?.length > 0 && (
                      <div className="kd-tag-row">
                        {item.dietaryTags.map((tag) => {
                          const c = DIETARY_COLOURS[tag];
                          return (
                            <span key={tag} className="kd-info-badge" style={c ? {
                              background: c.bg, borderColor: c.border, color: c.text,
                            } : {}}>
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Allergen badges */}
                    {item.allergens?.length > 0 && (
                      <div className="kd-tag-row">
                        {item.allergens.map((a) => {
                          const c = ALLERGEN_COLOURS[a];
                          return (
                            <span key={a} className="kd-info-badge kd-allergen-badge" style={c ? {
                              background: c.bg, borderColor: c.border, color: c.text,
                            } : {}}>
                              ⚠ {a}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <footer className="kd-item-actions">
                    {/* Sold-out toggle — leftmost, styled to reflect current state */}
                    <button
                      className={`kd-btn kd-btn--availability ${item.isSoldOut ? "kd-btn--mark-available" : "kd-btn--mark-soldout"}`}
                      onClick={() => handleToggleSoldOut(item)}
                      aria-label={item.isSoldOut ? `Mark ${item.name} as available` : `Mark ${item.name} as sold out`}
                    >
                      {item.isSoldOut ? "Available" : "Sold Out"}
                    </button>
                    <button className="kd-btn ghost" onClick={() => openEditModal(item)} aria-label={`Edit ${item.name}`}>Edit</button>
                    <button className="kd-btn danger" onClick={() => openDeleteModal(item.id)} aria-label={`Delete ${item.name}`}>Delete</button>
                  </footer>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ORDERS PAGE */}
        {activeNav === "orders" && <OrderManagement />}

        {/* REVIEWS PAGE */}
        {activeNav === "reviews" && (
          vendorId
            ? <VendorReviews vendorId={vendorId} />
            : <p style={{ color: "#475569", fontSize: "14px" }}>Vendor ID not available.</p>
        )}

        {/* OTHER PAGES */}
        {activeNav !== "menu" && activeNav !== "orders" && activeNav !== "reviews" && (
          <section aria-label={`${activeNav} placeholder`}>
            <p style={{ color: "#475569", fontSize: "14px" }}>
              The <strong>{activeNav}</strong> section is not yet implemented.
            </p>
          </section>
        )}
      </section>

      {/* ADD / EDIT MODAL */}
      {(modal === "add" || modal === "edit") && (
        <section className="kd-modal-overlay" role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <article className="kd-modal">
            {modal === "add" ? renderForm(handleSubmitAdd) : renderForm(handleSubmitEdit)}
          </article>
        </section>
      )}

      {/* DELETE CONFIRM MODAL */}
      {modal === "delete" && (
        <section className="kd-modal-overlay" role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <article className="kd-modal">
            <h2 className="kd-modal-title" id="delete-modal-title">Delete item</h2>
            <p className="kd-confirm-text">
              Are you sure you want to delete{" "}
              <strong className="kd-confirm-name">{pendingDeleteItem?.name}</strong>?
              This action cannot be undone.
            </p>
            <footer className="kd-form-footer">
              <button className="kd-btn ghost" onClick={closeModal}>Cancel</button>
              <button className="kd-btn danger" onClick={handleConfirmDelete}>Yes, delete</button>
            </footer>
          </article>
        </section>
      )}

    </main>
  );
};

export default Vendor;