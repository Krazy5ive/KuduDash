import React, { useState } from "react";
import "./Student.css";

const Student = () => {
  const [expanded, setExpanded] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Vendors removed; variable no longer needed.

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

          {/* Overview button with grid icon */}
          <button className="kd-nav-item">
            <svg viewBox="0 0 24 24" className="kd-icon">
              {/* Grid icon */}
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
              {selectedVendor ? selectedVendor.name : "Vendors"}
            </h1>
            <p className="kd-page-sub">
              {selectedVendor
                ? "Browse items"
                : "Choose where to order from"}
            </p>
          </section>

          <figure className="kd-avatar" style={{ fontFamily: "'Baloo 2', sans-serif" }}></figure>
        </header>

        {!selectedVendor ? (
          <section className="kd-grid">
            {/* No vendors to display */}
          </section>
        ) : (
          <section className="kd-menu-view">

            <button
              className="kd-back-btn"
              onClick={() => setSelectedVendor(null)}
            >
              ← Back
            </button>

            <section className="kd-menu-grid">
              {selectedVendor.menu.map((item, i) => (
                <article key={i} className="kd-menu-card">
                  <header className="kd-menu-header">
                    <h2>{item.name}</h2>
                    <data value={item.price}>{item.price}</data>
                  </header>

                  <footer>
                    <button className="kd-btn primary">Add</button>
                  </footer>
                </article>
              ))}
            </section>

          </section>
        )}

      </section>
    </main>
  );
};

export default Student;