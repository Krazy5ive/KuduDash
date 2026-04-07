import React, { useState } from "react";
import "./Vendor.css";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";

const VendorDashboard = () => {
  const { user, logout } = useAuth0();
  const [activeTab, setActiveTab] = useState("overview");

  // Vendor stats
  const stats = [
    { label: "Today's orders", value: 38, delta: "+12 vs yesterday" },
    { label: "Revenue today", value: "R2,840", delta: "+R490 vs yesterday" },
    { label: "Avg prep time", value: "11m", delta: "-1m this week" },
    { label: "Items sold out", value: 1, delta: "of 8 menu items" },
  ];

  // Menu items with toggle state
  const [menuItems, setMenuItems] = useState([
    { id: 1, emoji: "🍔", name: "Beef Burger Meal", desc: "With chips & drink", price: "R85", on: true },
    { id: 2, emoji: "🌮", name: "Chicken Taco", desc: "Spicy, gluten-free wrap", price: "R55", on: true },
    { id: 3, emoji: "🥗", name: "Greek Salad", desc: "Vegan, nut-free", price: "R60", on: false },
    { id: 4, emoji: "🍟", name: "Loaded Fries", desc: "Cheese, bacon, jalapeño", price: "R45", on: true },
  ]);

  // Incoming orders
  const [incomingOrders, setIncomingOrders] = useState([
    { id: "#1042", student: "Thabo M.", items: "Burger + Taco", time: "2 min ago", status: "new" },
    { id: "#1041", student: "Priya K.", items: "Greek Salad", time: "8 min ago", status: "prep" },
    { id: "#1040", student: "Ryan S.", items: "Loaded Fries x2", time: "14 min ago", status: "ready" },
  ]);

  // Peak hours data
  const peakHours = [5, 15, 30, 80, 95, 70, 40, 20, 10, 8, 45, 90];
  const hourLabels = ["8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];

  const handleAcceptOrder = (index) => {
    const updated = [...incomingOrders];
    updated[index].status = "prep";
    setIncomingOrders(updated);
  };

  const handleMarkReady = (index) => {
    const updated = [...incomingOrders];
    updated[index].status = "ready";
    setIncomingOrders(updated);
  };

  const toggleMenuItem = (id) => {
    setMenuItems(prev =>
      prev.map(item => (item.id === id ? { ...item, on: !item.on } : item))
    );
  };

  const handleAddItem = () => {
    alert("Add item (demo)");
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  const getInitials = () => {
    const vendorName = user?.name || "Matrix Grill";
    return vendorName.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <motion.div
      className="kd-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sidebar */}
      <aside className="kd-sidebar">
        <div className="kd-logo">Kudu<span>Dash</span></div>
        <nav className="kd-nav">
          <div
            className={`kd-nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
            role="tab"
            aria-selected={activeTab === "overview"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActiveTab("overview")}
          >
            <span style={{ fontSize: "15px" }} aria-hidden="true">⊞</span>
            <span>Overview</span>
          </div>
          <div
            className={`kd-nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
            role="tab"
            aria-selected={activeTab === "orders"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActiveTab("orders")}
          >
            <span style={{ fontSize: "15px" }} aria-hidden="true">📋</span>
            <span>Orders</span>
          </div>
          <div
            className={`kd-nav-item ${activeTab === "menu" ? "active" : ""}`}
            onClick={() => setActiveTab("menu")}
            role="tab"
            aria-selected={activeTab === "menu"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActiveTab("menu")}
          >
            <span style={{ fontSize: "15px" }} aria-hidden="true">🍽</span>
            <span>My Menu</span>
          </div>
          <div
            className={`kd-nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
            role="tab"
            aria-selected={activeTab === "analytics"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActiveTab("analytics")}
          >
            <span style={{ fontSize: "15px" }} aria-hidden="true">📊</span>
            <span>Analytics</span>
          </div>
        </nav>
        <div className="kd-logout">
          <button className="kd-btn danger" onClick={handleLogout}>
            ← Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="kd-main">
        <div className="kd-topbar">
          <div>
            <h1 className="kd-page-title">Vendor Dashboard</h1>
            <p className="kd-page-sub">You have {incomingOrders.filter(o => o.status === "new").length} new orders waiting.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: "500" }}>
                {user?.name || "Matrix Grill"}
              </div>
              <div style={{ fontSize: "11px", color: "#475569" }}>
                Vendor · Food court, Level 1
              </div>
            </div>
            <div className="kd-avatar" aria-label="Vendor avatar">
              {getInitials()}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="kd-stats">
          {stats.map((stat, idx) => (
            <div className="kd-stat" key={idx}>
              <div className="kd-stat-label">{stat.label}</div>
              <div className="kd-stat-value">{stat.value}</div>
              <div className="kd-stat-delta">{stat.delta}</div>
            </div>
          ))}
        </div>

        <div className="kd-grid2">
          {/* Incoming Orders Card */}
          <div className="kd-card">
            <h2 className="kd-card-title">Incoming orders</h2>
            {incomingOrders.map((order, idx) => (
              <div className="kd-order-item" key={order.id}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "13px", color: "#6ee7b7" }}>
                      {order.id}
                    </span>
                    <span style={{ fontSize: "13px", color: "#e2e8f0" }}>{order.student}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>
                    {order.items} · {order.time}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {order.status === "new" && (
                    <button
                      className="kd-btn primary"
                      style={{ fontSize: "11px" }}
                      onClick={() => handleAcceptOrder(idx)}
                    >
                      Accept
                    </button>
                  )}
                  {order.status === "prep" && (
                    <button
                      className="kd-btn"
                      style={{ fontSize: "11px", color: "#818cf8", borderColor: "rgba(99,102,241,0.3)" }}
                      onClick={() => handleMarkReady(idx)}
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === "ready" && (
                    <span className="kd-badge badge-ready">Ready</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Peak Hours Chart */}
          <div className="kd-card">
            <h2 className="kd-card-title">Peak hours today</h2>
            <div className="kd-chart" role="img" aria-label="Peak hours chart">
              {peakHours.map((h, idx) => {
                const barHeight = (h / 100) * 80;
                return (
                  <div className="kd-chart-col" key={idx}>
                    <div
                      className="kd-chart-bar"
                      style={{
                        height: `${barHeight}px`,
                        background: h > 70
                          ? "linear-gradient(to top, #6ee7b7, #6366f1)"
                          : "rgba(255,255,255,0.07)",
                      }}
                      aria-label={`${hourLabels[idx]}: ${h} orders`}
                    />
                    <div className="kd-chart-lbl">{hourLabels[idx]}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: "12px", fontSize: "12px", color: "#475569" }}>
              Peak: 12:00 – 13:00 · 95 orders
            </div>
          </div>

          {/* Menu Items Card */}
          <div className="kd-card kd-full">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 className="kd-card-title" style={{ marginBottom: 0 }}>Menu items</h2>
              <button className="kd-btn primary" onClick={handleAddItem}>
                + Add item
              </button>
            </div>
            {menuItems.map((item) => (
              <div className="kd-menu-item" key={item.id}>
                <div className="kd-menu-thumb" aria-hidden="true">{item.emoji}</div>
                <div className="kd-menu-info">
                  <div className="kd-menu-name">{item.name}</div>
                  <div className="kd-menu-desc">{item.desc}</div>
                </div>
                <div className="kd-menu-price">{item.price}</div>
                <button
                  className={`kd-toggle ${item.on ? "on" : "off"}`}
                  onClick={() => toggleMenuItem(item.id)}
                  aria-label={item.on ? "Disable item" : "Enable item"}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default VendorDashboard;