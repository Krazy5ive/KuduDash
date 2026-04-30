//Admin.js
import React, { useState, useMemo, useEffect, useCallback } from "react";
import "./Admin.css";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import ProfilePanel from "./ProfilePanel";

const initials = (name) =>
  name.split(" ").slice(0, 2).map((w) => w[0].toUpperCase()).join("");

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });

// ── Sub-components ────────────────────────────────────────────────────

const StatsRow = ({ items, type }) => {
  const total    = items.length;
  const active   = items.filter((i) => i.status === "active").length;
  const inactive = items.filter((i) => i.status === "inactive").length;
  const pending  = items.filter((i) => i.status === "pending").length;
  return (
    <section className="kd-stats-row" aria-label={`${type} statistics`}>
      <article className="kd-stat-card"><p className="kd-stat-label">Total {type}</p><p className="kd-stat-value">{total}</p></article>
      <article className="kd-stat-card"><p className="kd-stat-label">Active</p><p className="kd-stat-value green">{active}</p></article>
      <article className="kd-stat-card"><p className="kd-stat-label">Inactive</p><p className="kd-stat-value">{inactive}</p></article>
      <article className="kd-stat-card"><p className="kd-stat-label">Pending</p><p className="kd-stat-value">{pending}</p></article>
    </section>
  );
};



const VendorModal = ({ vendor, onClose }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
        });
        const res = await fetch(
          `http://localhost:5000/api/orders/admin/vendor/${vendor._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch vendor orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [vendor._id, getAccessTokenSilently]);

  return (
    <section className="kd-modal-overlay" role="dialog" aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <article className="kd-modal">
        <header><h2 className="kd-modal-title">Vendor profile</h2></header>
        <figure className="kd-cell-name" style={{ marginBottom: "4px" }}>
          <p className="kd-cell-avatar purple" aria-hidden="true">{initials(vendor.businessName)}</p>
          <figcaption className="kd-cell-name-text">
            <strong>{vendor.businessName}</strong>
            <small className="kd-cell-subtext">{vendor.email}</small>
          </figcaption>
        </figure>
        <ul className="kd-detail-list">
          {[
            ["Location", vendor.location],
            ["Owner", `${vendor.ownerFirstName} ${vendor.ownerLastName}`],
            ["Phone", vendor.phone],
            ["Date joined", formatDate(vendor.createdAt)],
            ["Status", vendor.status],
          ].map(([label, value]) => (
            <li className="kd-detail-row" key={label}>
              <p className="kd-detail-label">{label}</p>
              <p className="kd-detail-value">
                {label === "Status"
                  ? <small className={`kd-badge ${value}`}>{value}</small>
                  : value}
              </p>
            </li>
          ))}
        </ul>

        <p className="kd-sidebar-title" style={{ marginTop: "16px" }}>Orders</p>
        {loadingOrders && <p className="kd-empty-state">Loading orders...</p>}
        {!loadingOrders && orders.length === 0 && (
          <p className="kd-empty-state">No orders found.</p>
        )}
        {orders.map((order) => (
          <section className="kd-detail-row" key={order._id}
            style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px", padding: "10px 0" }}>
            <section style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <section>
                <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  {formatDate(order.createdAt)}
                </p>
                <p style={{ fontSize: "13px" }}>
                  {order.student
                    ? `${order.student.firstName} ${order.student.lastName}`
                    : "—"}
                </p>
              </section>
              <section style={{ textAlign: "right" }}>
                <small className={`kd-badge ${order.status}`}>{order.status}</small>
                <p style={{ fontSize: "13px", color: "var(--kd-green)", marginTop: "2px" }}>
                  R{Number(order.totalAmount).toFixed(2)}
                </p>
              </section>
            </section>
          </section>
        ))}

        <footer className="kd-modal-footer">
          <button className="kd-btn ghost" onClick={onClose}>Close</button>
        </footer>
      </article>
    </section>
  );
};

// ── StudentModal ─────────────────────────────────────────────────────
const StudentModal = ({ student, onClose }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
        });
        const res = await fetch(
          `http://localhost:5000/api/orders/admin/student/${student._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch student orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [student._id, getAccessTokenSilently]);

  return (
    <section className="kd-modal-overlay" role="dialog" aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <article className="kd-modal">
        <header><h2 className="kd-modal-title">Student profile</h2></header>
        <figure className="kd-cell-name" style={{ marginBottom: "4px" }}>
          <p className="kd-cell-avatar green" aria-hidden="true">
            {initials(`${student.firstName} ${student.lastName}`)}
          </p>
          <figcaption className="kd-cell-name-text">
            <strong>{student.firstName} {student.lastName}</strong>
            <small className="kd-cell-subtext">{student.email}</small>
          </figcaption>
        </figure>
        <ul className="kd-detail-list">
          {[
            ["Date joined", formatDate(student.createdAt)],
            ["Status", student.isActive ? "active" : "inactive"],
          ].map(([label, value]) => (
            <li className="kd-detail-row" key={label}>
              <p className="kd-detail-label">{label}</p>
              <p className="kd-detail-value">
                {label === "Status"
                  ? <small className={`kd-badge ${value}`}>{value}</small>
                  : value}
              </p>
            </li>
          ))}
        </ul>

        <p className="kd-sidebar-title" style={{ marginTop: "16px" }}>Orders</p>
        {loadingOrders && <p className="kd-empty-state">Loading orders...</p>}
        {!loadingOrders && orders.length === 0 && (
          <p className="kd-empty-state">No orders found.</p>
        )}
        {orders.map((order) => (
          <section className="kd-detail-row" key={order._id}
            style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px", padding: "10px 0" }}>
            <section style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <section>
                <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  {formatDate(order.createdAt)}
                </p>
                <p style={{ fontSize: "13px" }}>
                  {order.vendor?.businessName ?? "—"}
                </p>
              </section>
              <section style={{ textAlign: "right" }}>
                <small className={`kd-badge ${order.status}`}>{order.status}</small>
                <p style={{ fontSize: "13px", color: "var(--kd-green)", marginTop: "2px" }}>
                  R{Number(order.totalAmount).toFixed(2)}
                </p>
              </section>
            </section>
          </section>
        ))}

        <footer className="kd-modal-footer">
          <button className="kd-btn ghost" onClick={onClose}>Close</button>
        </footer>
      </article>
    </section>
  );
};

const StudentsPage = () => {
  const [students, setStudents]             = useState([]);
  const [search, setSearch]                 = useState("");
  const [filterStatus, setFilterStatus]     = useState("all");
  const [viewingStudent, setViewingStudent] = useState(null);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/students")
      .then((res) => res.json())
      .then((data) => { setStudents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`;
    const matchSearch = fullName.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const studentStatus = s.isActive ? "active" : "inactive";
    return matchSearch && (filterStatus === "all" || studentStatus === filterStatus);
  }), [students, search, filterStatus]);

  const toggleStatus = (id) => {
    fetch(`http://localhost:5000/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !students.find((s) => s._id === id)?.isActive }),
    }).then((res) => res.json()).then((updated) => setStudents((prev) => prev.map((s) => s._id === id ? updated : s)));
  };

  return (
    <section aria-label="Students management">
      <StatsRow items={students.map((s) => ({ status: s.isActive ? "active" : "inactive" }))} type="students" />
      <form className="kd-search-row" role="search" onSubmit={(e) => e.preventDefault()}>
        <section className="kd-search-wrap">
          <svg className="kd-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
          <input className="kd-search-input" type="search" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search students" />
        </section>
        <ul className="kd-filter-list">
          {["all", "active", "inactive"].map((f) => (
            <li key={f}><button type="button" className={`kd-filter-pill ${filterStatus === f ? "active" : ""}`} onClick={() => setFilterStatus(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button></li>
          ))}
        </ul>
      </form>
      <section className="kd-table-wrap">
        <table className="kd-table">
          <thead><tr><th>First Name</th><th>Last Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={5}><p className="kd-empty-state">Loading students...</p></td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={5}><p className="kd-empty-state">No students found.</p></td></tr>}
            {filtered.map((student) => (
              <tr key={student._id}>
                <td>{student.firstName}</td><td>{student.lastName}</td><td>{student.email}</td>
                <td><small className={`kd-badge ${student.isActive ? "active" : "inactive"}`}>{student.isActive ? "active" : "inactive"}</small></td>
                <td>
                  <section className="kd-table-actions">
                    <button className="kd-action-btn view" onClick={() => setViewingStudent(student)}>View</button>
                    <button className={`kd-action-btn ${student.isActive ? "suspend" : "restore"}`} onClick={() => toggleStatus(student._id)}>
                      {student.isActive ? "Suspend" : "Restore"}
                    </button>
                  </section>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {viewingStudent && <StudentModal student={viewingStudent} onClose={() => setViewingStudent(null)} />}
    </section>
  );
};

const VendorsPage = () => {
  const [vendors, setVendors]             = useState([]);
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [viewingVendor, setViewingVendor] = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/vendors")
      .then((res) => res.json())
      .then((data) => { setVendors(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => vendors.filter((v) => {
    const matchSearch = v.businessName.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filterStatus === "all" || v.status === filterStatus);
  }), [vendors, search, filterStatus]);

  const toggleStatus = (id) => {
    const vendor = vendors.find((v) => v._id === id);
    const newStatus = vendor.status === "active" ? "suspended" : "active";
    fetch(`http://localhost:5000/api/vendors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).then((res) => res.json()).then((updated) => setVendors((prev) => prev.map((v) => v._id === id ? updated : v)));
  };

  return (
    <section aria-label="Vendors management">
      <StatsRow items={vendors} type="vendors" />
      <form className="kd-search-row" role="search" onSubmit={(e) => e.preventDefault()}>
        <section className="kd-search-wrap">
          <svg className="kd-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
          <input className="kd-search-input" type="search" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search vendors" />
        </section>
        <ul className="kd-filter-list">
          {["all", "active", "pending", "suspended"].map((f) => (
            <li key={f}><button type="button" className={`kd-filter-pill ${filterStatus === f ? "active" : ""}`} onClick={() => setFilterStatus(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button></li>
          ))}
        </ul>
      </form>
      <section className="kd-table-wrap">
        <table className="kd-table">
          <thead><tr><th>Business Name</th><th>Owner</th><th>Email</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6}><p className="kd-empty-state">Loading vendors...</p></td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6}><p className="kd-empty-state">No vendors found.</p></td></tr>}
            {filtered.map((vendor) => (
              <tr key={vendor._id}>
                <td>
                  <figure className="kd-cell-name">
                    <p className="kd-cell-avatar purple" aria-hidden="true">{initials(vendor.businessName)}</p>
                    <figcaption className="kd-cell-name-text"><strong>{vendor.businessName}</strong></figcaption>
                  </figure>
                </td>
                <td>{vendor.ownerFirstName} {vendor.ownerLastName}</td>
                <td>{vendor.email}</td><td>{vendor.location}</td>
                <td><small className={`kd-badge ${vendor.status}`}>{vendor.status}</small></td>
                <td>
                  <section className="kd-table-actions">
                    <button className="kd-action-btn view" onClick={() => setViewingVendor(vendor)}>View</button>
                    <button className={`kd-action-btn ${vendor.status === "active" ? "suspend" : "restore"}`} onClick={() => toggleStatus(vendor._id)}>
                      {vendor.status === "active" ? "Suspend" : "Restore"}
                    </button>
                  </section>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {viewingVendor && <VendorModal vendor={viewingVendor} onClose={() => setViewingVendor(null)} />}
    </section>
  );
};

const OverviewPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [orders, setOrders] = useState([]);
  const [students, setStudents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dateRange, setDateRange] = useState("all");

  const PAGE_SIZE = 10;

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/admin/all");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/students");
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  }, []);

  const fetchVendors = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      const res = await fetch("http://localhost:5000/api/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch vendors");
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOrders(), 
        fetchStudents(), 
        fetchVendors()
      ]);
      setLoading(false);
    };

    loadAllData();
  }, [fetchOrders, fetchStudents, fetchVendors]);

  const filteredByDate = useMemo(() => {
    if (dateRange === "all") return orders;
    const now = new Date();
    const cutoff = new Date();
    if (dateRange === "today") cutoff.setHours(0, 0, 0, 0);
    if (dateRange === "week")  cutoff.setDate(now.getDate() - 7);
    if (dateRange === "month") cutoff.setMonth(now.getMonth() - 1);
    return orders.filter((o) => new Date(o.createdAt) >= cutoff);
  }, [orders, dateRange]);

  const counts = useMemo(() => ({
    total: filteredByDate.length,
    totalAmount: filteredByDate.reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0),
    collected: filteredByDate.filter((o) => o.status === "collected").length,
    pending: filteredByDate.filter((o) => o.status === "pending").length,
    received:    filteredByDate.filter((o) => o.status === "received").length,
    paid:        filteredByDate.filter((o) => o.status === "paid").length,
    preparing:   filteredByDate.filter((o) => o.status === "preparing").length,
    ready:       filteredByDate.filter((o) => o.status === "ready").length,
    cancelled: filteredByDate.filter((o) => o.status === "cancelled").length,
  }), [filteredByDate]);

  const todaysCounts = useMemo(() => {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const todays = orders.filter((o) => new Date(o.createdAt) >= midnight);
  return {
    total:       todays.length,
    totalAmount: todays.reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0),
  };
}, [orders]);
  
  const filtered = useMemo(() =>
    filterStatus === "all" ? filteredByDate  : filteredByDate.filter((o) => o.status === filterStatus),
    [filteredByDate , filterStatus]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (f) => {
    setFilterStatus(f);
    setPage(1);
  };

  const barPct = (n) => counts.total ? Math.round((n / counts.total) * 100) : 0;

  const STATUS_FILTERS = ["all", "pending", "received", "paid", "preparing", "ready", "collected", "cancelled"];

  if (error) {
    return (
      <section className="kd-error-state">
        <p>Error loading orders: {error}</p>
        <button onClick={fetchOrders}>Retry</button>
      </section>
    );
  }

  return (
    <section aria-label="Overview">
      {/* Date range filter */}
      <section style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {[
          { label: "Today",      value: "today" },
          { label: "This week",  value: "week"  },
          { label: "This month", value: "month" },
          { label: "All time",   value: "all"   },
        ].map(({ label, value }) => (
          <button
            key={value}
            type="button"
            className={`kd-filter-pill ${dateRange === value ? "active" : ""}`}
            onClick={() => { setDateRange(value); setPage(1); }}
          >
            {label}
          </button>
        ))}
      </section>

      {/* Stat cards */}
      <section className="kd-stats-row" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <article className="kd-stat-card">
          <p className="kd-stat-label">Total orders</p>
          <p className="kd-stat-value">{counts.total}</p>
          {todaysCounts.total > 0 && (
            <p className="kd-stat-trend">
              ↑ {todaysCounts.total} today
            </p>
          )}
        </article>
        <article className="kd-stat-card">
          <p className="kd-stat-label">Total amount</p>
          <p className="kd-stat-value green">{counts.totalAmount.toFixed(2)}</p>
          {todaysCounts.totalAmount > 0 && (
            <p className="kd-stat-trend">
              ↑ R{todaysCounts.totalAmount.toFixed(2)} today
            </p>
          )}
        </article>
      </section>

      {/* Refresh button (optional - shows last updated time) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button 
          onClick={fetchOrders} 
          className="kd-btn ghost"
          style={{ fontSize: '12px' }}
        >
          ↻ Refresh {lastUpdated && `(Updated: ${lastUpdated.toLocaleTimeString()})`}
        </button>
      </div>

      {/* Two-column layout */}
      <section className="kd-overview-row">
        {/* Orders table */}
        <section>
          <form className="kd-search-row" role="search" onSubmit={(e) => e.preventDefault()}>
            <ul className="kd-filter-list">
              {STATUS_FILTERS.map((f) => (
                <li key={f}>
                  <button 
                    type="button" 
                    className={`kd-filter-pill ${filterStatus === f ? "active" : ""}`} 
                    onClick={() => handleFilterChange(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </form>
          <section className="kd-table-wrap">
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Student</th>
                  <th>Vendor</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6}><p className="kd-empty-state">Loading orders...</p></td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={6}><p className="kd-empty-state">No orders found.</p></td></tr>
                )}
                {paginated.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.student ? `${order.student.firstName} ${order.student.lastName}` : "—"}</td>
                    <td>{order.vendorName ?? order.vendor?.businessName ?? "—"}</td>
                    <td>R{Number(order.totalAmount || order.total).toFixed(2)}</td>
                    <td><small className={`kd-badge ${order.status}`}>{order.status}</small></td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "1rem", justifyContent: "flex-end" }}>
            <button
              className="kd-btn ghost"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="kd-btn ghost"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </section>
        </section>

        {/* Status breakdown sidebar */}
        <aside className="kd-overview-sidebar">
          <p className="kd-sidebar-title">Orders by status</p>
          {[
            { label: "Collected", key: "collected", color: "var(--kd-green)" },
            { label: "Pending", key: "pending", color: "var(--kd-amber)" },
            { label: "Received", key: "received", color: "var(--kd-amber)" },
            { label: "Paid", key: "paid", color: "var(--kd-amber)" },
            { label: "Preparing", key: "preparing", color: "var(--kd-amber)" },
            { label: "Ready", key: "ready", color: "var(--kd-green)" },
            { label: "Cancelled", key: "cancelled", color: "var(--kd-red)" },
          ].map(({ label, key, color }) => (
            <section className="kd-bar-row" key={key}>
              <section className="kd-bar-label">
                <span>{label}</span>
                <span>{counts[key]}</span>
              </section>
              <section className="kd-bar-track">
                <span 
                  className="kd-bar-fill" 
                  style={{ width: `${barPct(counts[key])}%`, background: color }} 
                />
              </section>
            </section>
          ))}

          <section className="kd-overview-divider" />

          <p className="kd-sidebar-title">Platform summary</p>
          <ul className="kd-summary-list">
            <li>
              <span>Active students</span>
              <strong>{students.filter((s) => s.isActive).length}</strong>
            </li>
            <li>
              <span>Active vendors</span>
              <strong>{vendors.filter((v) => v.status === "active").length}</strong>
            </li>
          </ul>
        </aside>
const MenuReviewPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError("");
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
        });
        const res = await fetch(`/api/menu?status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load menu approvals");
        const data = await res.json();
        setMenuItems(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [getAccessTokenSilently, refresh]);

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const approveItem = async (id) => {
    try {
      setError("");
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      const res = await fetch(`/api/menu/${id}/approval`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approvalStatus: "approved" }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Approval failed");
      }
      setRefresh((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const startReject = (id, existingReason = "") => {
    setRejectingId(id);
    setRejectReason(existingReason);
    setError("");
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectReason("");
    setError("");
  };

  const submitReject = async (item) => {
    if (!rejectReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      setError("");
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      const res = await fetch(`/api/menu/${item._id}/approval`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approvalStatus: "rejected", approvalReason: rejectReason }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Rejection failed");
      }
      setRefresh((prev) => prev + 1);
      cancelReject();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const text = `${item.name} ${item.category} ${item.vendor?.businessName || item.vendor}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <section aria-label="Menu review">
      <form className="kd-search-row" role="search" onSubmit={(e) => e.preventDefault()}>
        <section className="kd-search-wrap">
          <svg className="kd-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
          <input className="kd-search-input" type="search" placeholder="Search by item, vendor or category…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search menu items" />
        </section>
      </form>

      {error && <p className="kd-state-msg kd-error">{error}</p>}
      {loading && <p className="kd-state-msg">Loading pending menu items…</p>}

      <section className="kd-table-wrap">
        <table className="kd-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredItems.length === 0 && (
              <tr><td colSpan={5}><p className="kd-empty-state">No pending menu items found.</p></td></tr>
            )}
            {filteredItems.map((item) => (
              <React.Fragment key={item._id}>
                <tr>
                  <td>{item.vendor?.businessName || item.vendor || "Unknown"}</td>
                  <td>
                    <strong>{item.name}</strong>
                    {item.approvalReason && <p className="kd-item-reason">Reason: {item.approvalReason}</p>}
                  </td>
                  <td>{item.category}</td>
                  <td>R{Number(item.price).toFixed(2)}</td>
                  <td>
                    <section className="kd-table-actions">
                      <button className="kd-action-btn approve" onClick={() => approveItem(item._id)}>Approve</button>
                      <button className="kd-action-btn reject" onClick={() => startReject(item._id, item.approvalReason)}>Reject</button>
                    </section>
                  </td>
                </tr>
                {rejectingId === item._id && (
                  <tr className="kd-reject-row">
                    <td colSpan={5}>
                      <div className="kd-reject-form">
                        <label htmlFor={`reject-${item._id}`}>Reason for reject</label>
                        <textarea
                          id={`reject-${item._id}`}
                          className="kd-reject-textarea"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="e.g. contains allergens, not allowed ingredient, or incorrect pricing"
                        />
                        <div className="kd-reject-actions">
                          <button className="kd-btn danger" type="button" onClick={() => submitReject(item)}>
                            Submit rejection
                          </button>
                          <button className="kd-btn ghost" type="button" onClick={cancelReject}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

          </tbody>
        </table>
      </section>
    </section>
  );
};

const PlaceholderPage = ({ label }) => (
  <section aria-label={`${label} placeholder`} className="kd-placeholder">
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 9h6M9 13h4" /></svg>
    <strong>{label}</strong>
    <p>This section is not yet implemented.</p>
  </section>
);

const NAV_ITEMS = [
  { id: "overview",  label: "Overview",  icon: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /></> },
  { id: "students",  label: "Students",  icon: <><path d="M12 3L2 8l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></> },
  { id: "vendors",   label: "Vendors",   icon: <path d="M3 9l9-6 9 6v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /> },
  { id: "menu",      label: "Menu Review", icon: <path d="M4 6h16v2H4zm0 6h16v2H4zm0 6h16v2H4z" /> },
  { id: "orders",    label: "Orders",    icon: <path d="M6 2h12v20H6zM6 6h12" /> },
  { id: "analytics", label: "Analytics", icon: <path d="M4 20V10M9 20V4M14 20v-6M19 20v-9" /> },
  { id: "reports",   label: "Reports",   icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></> },
  { id: "settings",  label: "Settings",  icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></> },
];

const PAGE_SUBTITLES = {
  overview: "Platform at a glance", students: "Manage registered students",
  vendors: "Manage registered vendors", menu: "Review vendor menu items",
  orders: "View and manage all orders", analytics: "Platform usage and trends",
  reports: "Generated reports", settings: "System configuration",
};

// ── Main Admin component ─────────────────────────────────────────────

const Admin = () => {
  const { getAccessTokenSilently, user: auth0User } = useAuth0();
  const location = useLocation();

  const [expanded, setExpanded]         = useState(false);
  const [activeNav, setActiveNav]       = useState("overview");
  const [adminProfile, setAdminProfile] = useState(null);

  useEffect(() => {
    const state = location.state;

    // Vibe.js sends ownerFirstName/ownerLastName — map them to the shape
    // ProfilePanel expects (firstName / lastName)
    if (state?.ownerFirstName) {
      setAdminProfile({
        firstName: state.ownerFirstName,
        lastName:  state.ownerLastName || "",
        email:     auth0User?.email    || "",
      });
      return;
    }

    // Returning admin (page refresh / direct URL) — fetch from API using Auth0 sub
    if (!auth0User?.sub) return;

    getAccessTokenSilently({
      authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
    })
      .then((token) =>
        fetch(`/api/admin/${auth0User.sub}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setAdminProfile(data); })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth0User]);

  const renderPage = () => {
    switch (activeNav) {
      case "students": return <StudentsPage />;
      case "vendors":  return <VendorsPage />;
      case "overview": return <OverviewPage />;
      case "menu":     return <MenuReviewPage />;
      default:         return <PlaceholderPage label={NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? activeNav} />;
    }
  };

  return (
    <main className="kd-app">
      <aside
        className={`kd-sidebar ${expanded ? "expanded" : ""}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        aria-label="Admin navigation"
      >
        <header className="kd-logo" aria-label="KuduDash admin portal">
          {expanded ? "KuduDash" : "KD"}
        </header>
        <nav className="kd-nav" aria-label="Main menu">
          <ul className="kd-nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  className={`kd-nav-item ${activeNav === item.id ? "active" : ""}`}
                  onClick={() => setActiveNav(item.id)}
                  aria-current={activeNav === item.id ? "page" : undefined}
                >
                  <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true">{item.icon}</svg>
                  {expanded && <p className="kd-nav-text">{item.label}</p>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <section className="kd-main">
        <header className="kd-topbar">
          <section>
            <h1 className="kd-page-title">{NAV_ITEMS.find((n) => n.id === activeNav)?.label}</h1>
            <p className="kd-page-sub">{PAGE_SUBTITLES[activeNav]}</p>
          </section>

          <ProfilePanel role="admin" user={adminProfile} />
        </header>

        {renderPage()}
      </section>
    </main>
  );
};

export default Admin;