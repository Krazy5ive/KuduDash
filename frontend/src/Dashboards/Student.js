import React, { useState } from "react";
import "./Student.css";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, logout } = useAuth0();
  const [activeTab, setActiveTab] = useState("overview");

  // Static data (replace with API calls)
  const stats = [
    { label: "Orders this month", value: 14, delta: "+3 this week" },
    { label: "Total spent", value: "R482", delta: "+R120 this week" },
    { label: "Favourite vendor", value: "Kaldi", delta: "6 orders" },
    { label: "Avg wait time", value: "8m", delta: "-2m vs last week" },
  ];

  const activeOrders = [
    { id: 1, name: "Beef Burger Meal", vendor: "Matrix Grill", status: "ready", emoji: "🍔" },
    { id: 2, name: "Greek Salad", vendor: "FreshBowl Co.", status: "preparing", emoji: "🥗" },
    { id: 3, name: "Flat White", vendor: "Kaldi Café", status: "received", emoji: "☕" },
  ];

  const orderHistory = [
    { item: "Chicken Wrap", vendor: "Matrix Grill", date: "3 Apr 2026", amount: "R65", status: "completed" },
    { item: "Cappuccino", vendor: "Kaldi Café", date: "2 Apr 2026", amount: "R35", status: "completed" },
    { item: "Vegan Bowl", vendor: "FreshBowl Co.", date: "1 Apr 2026", amount: "R89", status: "completed" },
    { item: "Bunny Chow", vendor: "Spice House", date: "31 Mar 2026", amount: "R72", status: "completed" },
  ];

  const weekSpending = [40, 65, 30, 80, 55, 90, 45];
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  const allergens = [
    { emoji: "🌾", label: "Gluten-free" },
    { emoji: "🥛", label: "Dairy-free" },
    { emoji: "🌿", label: "Vegan" },
    { emoji: "🥜", label: "Nut-free" },
  ];

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const readyCount = activeOrders.filter(o => o.status === "ready").length;
  const greetingMessage = `${getGreeting()}, ${user?.given_name || "Student"} — ${readyCount} order${readyCount !== 1 ? "s are" : " is"} ready for pickup.`;

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <motion.div
      className="kd-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sidebar – using divs for nav items to preserve exact visual (no button overrides needed) */}
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
            className={`kd-nav-item ${activeTab === "menu" ? "active" : ""}`}
            onClick={() => setActiveTab("menu")}
            role="tab"
            aria-selected={activeTab === "menu"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActiveTab("menu")}
          >
            <span style={{ fontSize: "15px" }} aria-hidden="true">🍽</span>
            <span>Browse Menu</span>
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
            <span>My Orders</span>
          </div>
          <div
            className={`kd-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
            role="tab"
            aria-selected={activeTab === "profile"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActiveTab("profile")}
          >
            <span style={{ fontSize: "15px" }} aria-hidden="true">👤</span>
            <span>Profile</span>
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
            <h1 className="kd-page-title">My Dashboard</h1>
            <p className="kd-page-sub">{greetingMessage}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: "500" }}>
                {user?.name || "Student"}
              </div>
              <div style={{ fontSize: "11px", color: "#475569" }}>
                Student · BSc Computer Science
              </div>
            </div>
            <div className="kd-avatar" aria-label="User avatar">
              {getInitials()}
            </div>
          </div>
        </div>

        {/* Stats Section */}
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
          {/* Active Orders Card */}
          <div className="kd-card">
            <h2 className="kd-card-title">Active orders</h2>
            {activeOrders.map(order => (
              <div className="kd-order-item" key={order.id}>
                <div className="kd-order-img" aria-hidden="true">{order.emoji}</div>
                <div>
                  <div className="kd-order-name">{order.name}</div>
                  <div className="kd-order-vendor">{order.vendor}</div>
                </div>
                <div className={`kd-badge badge-${order.status === "ready" ? "ready" : order.status === "preparing" ? "prep" : "received"}`}>
                  {order.status === "ready" && "Ready"}
                  {order.status === "preparing" && "Preparing"}
                  {order.status === "received" && "Received"}
                </div>
              </div>
            ))}
          </div>

          {/* Spending Chart + Allergens */}
          <div className="kd-card">
            <h2 className="kd-card-title">Spending this week</h2>
            <div className="kd-chart" role="img" aria-label="Weekly spending chart">
              {weekSpending.map((height, idx) => (
                <div className="kd-chart-col" key={idx}>
                  <div
                    className="kd-chart-bar"
                    style={{
                      height: `${height}px`,
                      background: idx === 5
                        ? "linear-gradient(to top, #6ee7b7, #6366f1)"
                        : "rgba(255,255,255,0.07)",
                    }}
                    aria-label={`${days[idx]}: R${height}`}
                  />
                  <div className="kd-chart-lbl">{days[idx]}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {allergens.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "rgba(110,231,183,0.08)",
                    border: "1px solid rgba(110,231,183,0.15)",
                    borderRadius: "20px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    color: "#6ee7b7",
                  }}
                >
                  <span style={{ fontSize: "13px" }}>{a.emoji}</span> {a.label}
                </div>
              ))}
            </div>
          </div>

          {/* Order History Table */}
          <div className="kd-card kd-full">
            <h2 className="kd-card-title">Order history</h2>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.map((order, idx) => (
                  <tr key={idx}>
                    <td style={{ color: "#e2e8f0" }}>{order.item}</td>
                    <td>{order.vendor}</td>
                    <td>{order.date}</td>
                    <td style={{ color: "#6ee7b7", fontFamily: "'Syne', sans-serif" }}>{order.amount}</td>
                    <td><span className="kd-badge badge-ready">{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default Dashboard;