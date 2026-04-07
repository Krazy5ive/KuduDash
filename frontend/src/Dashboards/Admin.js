import React, { useState } from "react";
import "./Admin.css";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const { user, logout } = useAuth0();
  const [activeTab, setActiveTab] = useState("overview");

  // Stats data
  const stats = [
    { label: "Total orders today", value: 316, delta: "+44 vs yesterday" },
    { label: "Platform revenue", value: "R25,170", delta: "+R3,200 this week" },
    { label: "Active vendors", value: 3, delta: "of 5 registered" },
    { label: "Registered students", value: 1204, delta: "+18 this week" },
  ];

  // Vendors data with status
  const [vendors, setVendors] = useState([
    { id: 1, name: "Matrix Grill", initials: "MG", color: "#6ee7b7", orders: 142, revenue: "R11,240", status: "active" },
    { id: 2, name: "Kaldi Café", initials: "KC", color: "#818cf8", orders: 98, revenue: "R7,810", status: "active" },
    { id: 3, name: "FreshBowl Co.", initials: "FB", color: "#6366f1", orders: 76, revenue: "R6,120", status: "active" },
    { id: 4, name: "Spice House", initials: "SH", color: "#f87171", orders: 0, revenue: "R0", status: "suspended" },
    { id: 5, name: "Wrap Republic", initials: "WR", color: "#475569", orders: 0, revenue: "R0", status: "pending" },
  ]);

  // Compliance data
  const compliance = [
    { label: "Allergen info complete", pct: 78, color: "#6ee7b7" },
    { label: "Vendors approved", pct: 60, color: "#6366f1" },
    { label: "Payment gateway active", pct: 80, color: "#818cf8" },
  ];

  // Recent activity
  const recentActivity = [
    { id: 1, color: "#6ee7b7", text: "Wrap Republic submitted vendor application", time: "5 min ago" },
    { id: 2, color: "#818cf8", text: "Kaldi Café updated their menu (4 items changed)", time: "22 min ago" },
    { id: 3, color: "#f87171", text: "Spice House account suspended by admin", time: "1h ago" },
    { id: 4, color: "#6366f1", text: "New student registered: Amara Dube", time: "2h ago" },
    { id: 5, color: "#475569", text: "Analytics report exported (CSV) by treasurer", time: "3h ago" },
  ];

  // Sales table data
  const salesData = [
    { vendor: "Matrix Grill", orders: "142", revenue: "R11,240", avgOrder: "R79", compliance: "94%" },
    { vendor: "Kaldi Café", orders: "98", revenue: "R7,810", avgOrder: "R80", compliance: "88%" },
    { vendor: "FreshBowl Co.", orders: "76", revenue: "R6,120", avgOrder: "R81", compliance: "100%" },
  ];

  const handleApproveVendor = (id) => {
    setVendors(prev =>
      prev.map(vendor =>
        vendor.id === id ? { ...vendor, status: "active" } : vendor
      )
    );
  };

  const handleSuspendVendor = (id) => {
    setVendors(prev =>
      prev.map(vendor =>
        vendor.id === id ? { ...vendor, status: "suspended" } : vendor
      )
    );
  };

  const handleReinstateVendor = (id) => {
    setVendors(prev =>
      prev.map(vendor =>
        vendor.id === id ? { ...vendor, status: "active" } : vendor
      )
    );
  };

  const handleExportCSV = () => {
    alert("Export CSV (demo)");
  };

  const handleExportPDF = () => {
    alert("Export PDF (demo)");
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  const getInitials = () => {
    const adminName = user?.name || "Admin User";
    return adminName.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getStatusBadgeClass = (status) => {
    if (status === "active") return "badge-ready";
    if (status === "suspended") return "badge-missed";
    return "badge-received";
  };

  const getStatusDisplay = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getComplianceColor = (compliance) => {
    const value = parseInt(compliance);
    if (value >= 95) return "#6ee7b7";
    if (value >= 80) return "#818cf8";
    return "#f87171";
  };

  const pendingCount = vendors.filter(v => v.status === "pending").length;

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
            className={`kd-nav-item ${activeTab === "vendors" ? "active" : ""}`}
            onClick={() => setActiveTab("vendors")}
            role="tab"
            aria-selected={activeTab === "vendors"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActiveTab("vendors")}
          >
            <span style={{ fontSize: "15px" }} aria-hidden="true">🏪</span>
            <span>Vendors</span>
          </div>
          <div
            className={`kd-nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
            role="tab"
            aria-selected={activeTab === "users"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActiveTab("users")}
          >
            <span style={{ fontSize: "15px" }} aria-hidden="true">👥</span>
            <span>Users</span>
          </div>
          <div
            className={`kd-nav-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
            role="tab"
            aria-selected={activeTab === "reports"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActiveTab("reports")}
          >
            <span style={{ fontSize: "15px" }} aria-hidden="true">📊</span>
            <span>Reports</span>
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
            <h1 className="kd-page-title">Admin Overview</h1>
            <p className="kd-page-sub">{pendingCount} vendor{pendingCount !== 1 ? "s" : ""} pending approval.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: "500" }}>
                {user?.name || "Admin User"}
              </div>
              <div style={{ fontSize: "11px", color: "#475569" }}>
                Platform Administrator
              </div>
            </div>
            <div className="kd-avatar" aria-label="Admin avatar">
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
          {/* Vendor Management Card */}
          <div className="kd-card">
            <h2 className="kd-card-title">Vendor management</h2>
            {vendors.map((vendor) => (
              <div className="kd-user-row" key={vendor.id}>
                <div
                  className="kd-user-avatar"
                  style={{ background: `${vendor.color}22`, color: vendor.color }}
                >
                  {vendor.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13.5px", color: "#e2e8f0", fontWeight: "500" }}>
                    {vendor.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569" }}>
                    {vendor.orders} orders · {vendor.revenue}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span className={`kd-badge ${getStatusBadgeClass(vendor.status)}`}>
                    {getStatusDisplay(vendor.status)}
                  </span>
                  {vendor.status === "pending" && (
                    <button
                      className="kd-btn primary"
                      style={{ fontSize: "11px" }}
                      onClick={() => handleApproveVendor(vendor.id)}
                    >
                      Approve
                    </button>
                  )}
                  {vendor.status === "active" && (
                    <button
                      className="kd-btn danger"
                      style={{ fontSize: "11px" }}
                      onClick={() => handleSuspendVendor(vendor.id)}
                    >
                      Suspend
                    </button>
                  )}
                  {vendor.status === "suspended" && (
                    <button
                      className="kd-btn"
                      style={{ fontSize: "11px" }}
                      onClick={() => handleReinstateVendor(vendor.id)}
                    >
                      Reinstate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Platform Health Card */}
          <div className="kd-card">
            <h2 className="kd-card-title">Platform health</h2>
            {compliance.map((item, idx) => (
              <div className="kd-bar-wrap" key={idx}>
                <div className="kd-bar-label">
                  <span>{item.label}</span>
                  <span style={{ color: "#e2e8f0" }}>{item.pct}%</span>
                </div>
                <div className="kd-bar-track">
                  <div
                    className="kd-bar-fill"
                    style={{ width: `${item.pct}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
            <div style={{ marginTop: "20px" }}>
              <h2 className="kd-card-title">Recent activity</h2>
              {recentActivity.map((activity) => (
                <div className="kd-notification" key={activity.id}>
                  <div
                    className="kd-notif-dot"
                    style={{ background: activity.color }}
                  />
                  <div>
                    <div className="kd-notif-text">{activity.text}</div>
                    <div className="kd-notif-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Table Card */}
          <div className="kd-card kd-full">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 className="kd-card-title" style={{ marginBottom: 0 }}>
                Sales per vendor — this week
              </h2>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="kd-btn" onClick={handleExportCSV}>
                  Export CSV
                </button>
                <button className="kd-btn" onClick={handleExportPDF}>
                  Export PDF
                </button>
              </div>
            </div>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Avg order</th>
                  <th>Compliance</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ color: "#e2e8f0", fontWeight: "500" }}>{row.vendor}</td>
                    <td>{row.orders}</td>
                    <td style={{ color: "#6ee7b7", fontFamily: "'Syne', sans-serif" }}>
                      {row.revenue}
                    </td>
                    <td>{row.avgOrder}</td>
                    <td style={{ color: getComplianceColor(row.compliance) }}>
                      {row.compliance}
                    </td>
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

export default AdminDashboard;