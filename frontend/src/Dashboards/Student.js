import React, { useState, useEffect } from "react";
import "./Student.css";

const CATEGORIES = ["Food", "Drink", "Snack", "Dessert", "Other"];

// Replace with real auth data as needed
const STUDENT_PROFILE = {
  photo:      "",
  firstName:  "Student",
  lastName:   "User",
  email:      "student@kududash.com",
};

const getInitials = (firstName, lastName) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const Student = () => {
  const [expanded, setExpanded] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [profileOpen, setProfileOpen] = useState(false);

  const studentInitials = getInitials(STUDENT_PROFILE.firstName, STUDENT_PROFILE.lastName);

  // fetch vendors
  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch vendors");
        return res.json();
      })
      .then((data) => { setVendors(data); setLoadingVendors(false); })
      .catch((err) => { setError(err.message); setLoadingVendors(false); });
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
      .then((data) => { setMenuItems(data); setLoadingMenu(false); })
      .catch((err) => { setError(err.message); setLoadingMenu(false); });
  }, [selectedVendor]);

  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

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

          <button className="kd-nav-item active">
            <svg viewBox="0 0 24 24" className="kd-icon">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {expanded && <p className="kd-nav-text">Vendors</p>}
          </button>

          <button className="kd-nav-item">
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
              <path d="M12 4v16M4 12h16" />
            </svg>
            {expanded && <p className="kd-nav-text">Help</p>}
          </button>

          <button className="kd-nav-item">
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
              {selectedVendor ? selectedVendor.businessName : "Vendors"}
            </h1>
            <p className="kd-page-sub">
              {selectedVendor ? "Browse items" : "Choose where to order from"}
            </p>
          </section>

          <figure
            className="kd-avatar"
            style={{ fontFamily: "'Baloo 2', sans-serif", cursor: "pointer" }}
            onClick={() => setProfileOpen(true)}
            title="My profile"
            aria-label="Open profile"
          >
            {studentInitials}
          </figure>
        </header>

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
            <nav className="kd-menu-nav" aria-label="Menu navigation"></nav>
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
                      {item.category && (
                        <p><small>{item.category}</small></p>
                      )}
                    </section>
                    <footer>
                      <data value={item.price}>R{item.price}</data>
                      <button className="kd-btn">+ Add</button>
                    </footer>
                  </article>
                ))
              )}
            </section>
          </section>
        )}
      </section>

      {/* PROFILE SIDEBAR */}
      {profileOpen && (
        <aside className="kd-profile-sidebar open" aria-label="Student profile panel">
          <header className="kd-profile-header">
            <h2 className="kd-profile-title">My Profile</h2>
            <button className="kd-profile-close" onClick={() => setProfileOpen(false)} aria-label="Close profile">✕</button>
          </header>

          <section className="kd-profile-avatar-wrap">
            {STUDENT_PROFILE.photo ? (
              <img
                src={STUDENT_PROFILE.photo}
                alt="Profile"
                className="kd-profile-photo"
              />
            ) : (
              <figure className="kd-profile-avatar">{studentInitials}</figure>
            )}
          </section>

          <ul className="kd-profile-details">
            <li className="kd-profile-row">
              <p className="kd-profile-label">First name</p>
              <p className="kd-profile-value">{STUDENT_PROFILE.firstName}</p>
            </li>
            <li className="kd-profile-row">
              <p className="kd-profile-label">Last name</p>
              <p className="kd-profile-value">{STUDENT_PROFILE.lastName}</p>
            </li>
            <li className="kd-profile-row">
              <p className="kd-profile-label">Email</p>
              <p className="kd-profile-value">{STUDENT_PROFILE.email}</p>
            </li>
          </ul>

          <footer className="kd-profile-footer">
            <button
              className="kd-btn danger"
              style={{ width: "100%" }}
              onClick={() => window.location.href = "/"}
            >
              Log out
            </button>
          </footer>
        </aside>
      )}

      {profileOpen && (
        <aside className="kd-profile-backdrop" onClick={() => setProfileOpen(false)} aria-hidden="true" tabIndex={-1} />
      )}

    </main>
  );
};

export default Student;