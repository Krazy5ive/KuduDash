//Admin.js
import React, { useState, useMemo, useEffect } from "react";
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

const StudentModal = ({ student, onClose }) => (
  <section className="kd-modal-overlay" role="dialog" aria-modal="true"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <article className="kd-modal">
      <header><h2 className="kd-modal-title" id="modal-title">Student profile</h2></header>
      <figure className="kd-cell-name" style={{ marginBottom: "4px" }}>
        <p className="kd-cell-avatar green" aria-hidden="true">{initials(student.firstName + " " + student.lastName)}</p>
        <figcaption className="kd-cell-name-text">
          <strong>{student.firstName} {student.lastName}</strong>
          <small className="kd-cell-subtext">{student.email}</small>
        </figcaption>
      </figure>
      <ul className="kd-detail-list">
        {[["Date joined", formatDate(student.createdAt)], ["Status", student.isActive ? "active" : "inactive"]].map(([label, value]) => (
          <li className="kd-detail-row" key={label}>
            <p className="kd-detail-label">{label}</p>
            <p className="kd-detail-value">{label === "Status" ? <small className={`kd-badge ${value}`}>{value}</small> : value}</p>
          </li>
        ))}
      </ul>
      <footer className="kd-modal-footer"><button className="kd-btn ghost" onClick={onClose}>Close</button></footer>
    </article>
  </section>
);

const VendorModal = ({ vendor, onClose }) => (
  <section className="kd-modal-overlay" role="dialog" aria-modal="true"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <article className="kd-modal">
      <header><h2 className="kd-modal-title" id="vendor-modal-title">Vendor profile</h2></header>
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
            <p className="kd-detail-value">{label === "Status" ? <small className={`kd-badge ${value}`}>{value}</small> : value}</p>
          </li>
        ))}
      </ul>
      <footer className="kd-modal-footer"><button className="kd-btn ghost" onClick={onClose}>Close</button></footer>
    </article>
  </section>
);

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
  { id: "orders",    label: "Orders",    icon: <path d="M6 2h12v20H6zM6 6h12" /> },
  { id: "analytics", label: "Analytics", icon: <path d="M4 20V10M9 20V4M14 20v-6M19 20v-9" /> },
  { id: "reports",   label: "Reports",   icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></> },
  { id: "settings",  label: "Settings",  icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></> },
];

const PAGE_SUBTITLES = {
  overview: "Platform at a glance", students: "Manage registered students",
  vendors: "Manage registered vendors", orders: "View and manage all orders",
  analytics: "Platform usage and trends", reports: "Generated reports", settings: "System configuration",
};

// ── Main Admin component ─────────────────────────────────────────────

const Admin = () => {
  const { getAccessTokenSilently, user: auth0User } = useAuth0();
  const location = useLocation();

  const [expanded, setExpanded]         = useState(false);
  const [activeNav, setActiveNav]       = useState("students");
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