import React, { useState, useMemo } from "react";
import "./Admin.css";

/* ──────────────────────────────────────────
   SEED DATA
────────────────────────────────────────── */

const SEED_STUDENTS = [];

const SEED_VENDORS = [];

/* ──────────────────────────────────────────
   HELPERS
────────────────────────────────────────── */

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* ──────────────────────────────────────────
   STAT CARDS
────────────────────────────────────────── */

const StatsRow = ({ items, type }) => {
  const total    = items.length;
  const active   = items.filter((i) => i.status === "active").length;
  const inactive = items.filter((i) => i.status === "inactive").length;
  const pending  = items.filter((i) => i.status === "pending").length;

  return (
    <section className="kd-stats-row" aria-label={`${type} statistics`}>
      <article className="kd-stat-card">
        <p className="kd-stat-label">Total {type}</p>
        <p className="kd-stat-value">{total}</p>
      </article>
      <article className="kd-stat-card">
        <p className="kd-stat-label">Active</p>
        <p className="kd-stat-value green">{active}</p>
      </article>
      <article className="kd-stat-card">
        <p className="kd-stat-label">Inactive</p>
        <p className="kd-stat-value">{inactive}</p>
      </article>
      <article className="kd-stat-card">
        <p className="kd-stat-label">Pending</p>
        <p className="kd-stat-value">{pending}</p>
      </article>
    </section>
  );
};

/* ──────────────────────────────────────────
   STUDENT DETAIL MODAL
────────────────────────────────────────── */

const StudentModal = ({ student, onClose }) => (
  <section
    className="kd-modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <article className="kd-modal">
      <header>
        <h2 className="kd-modal-title" id="modal-title">Student profile</h2>
      </header>

      <figure className="kd-cell-name" style={{ marginBottom: "4px" }}>
        <p className={`kd-cell-avatar green`} aria-hidden="true">{initials(student.name)}</p>
        <figcaption className="kd-cell-name-text">
          <strong>{student.name}</strong>
          <small className="kd-cell-subtext">{student.email}</small>
        </figcaption>
      </figure>

      <ul className="kd-detail-list" aria-label="Student details">
        {[
          ["Student number", student.studentNo],
          ["Faculty",        student.faculty],
          ["Date joined",    formatDate(student.joined)],
          ["Status",         student.status],
        ].map(([label, value]) => (
          <li className="kd-detail-row" key={label}>
            <p className="kd-detail-label">{label}</p>
            <p className="kd-detail-value">
              {label === "Status" ? (
                <small className={`kd-badge ${value}`}>{value}</small>
              ) : value}
            </p>
          </li>
        ))}
      </ul>

      <footer className="kd-modal-footer">
        <button className="kd-btn ghost" onClick={onClose}>Close</button>
      </footer>
    </article>
  </section>
);

/* ──────────────────────────────────────────
   VENDOR DETAIL MODAL
────────────────────────────────────────── */

const VendorModal = ({ vendor, onClose }) => (
  <section
    className="kd-modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="vendor-modal-title"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <article className="kd-modal">
      <header>
        <h2 className="kd-modal-title" id="vendor-modal-title">Vendor profile</h2>
      </header>

      <figure className="kd-cell-name" style={{ marginBottom: "4px" }}>
        <p className="kd-cell-avatar purple" aria-hidden="true">{initials(vendor.name)}</p>
        <figcaption className="kd-cell-name-text">
          <strong>{vendor.name}</strong>
          <small className="kd-cell-subtext">{vendor.email}</small>
        </figcaption>
      </figure>

      <ul className="kd-detail-list" aria-label="Vendor details">
        {[
          ["Vendor number", vendor.vendorNo],
          ["Category",      vendor.category],
          ["Menu items",    vendor.items],
          ["Date joined",   formatDate(vendor.joined)],
          ["Status",        vendor.status],
        ].map(([label, value]) => (
          <li className="kd-detail-row" key={label}>
            <p className="kd-detail-label">{label}</p>
            <p className="kd-detail-value">
              {label === "Status" ? (
                <small className={`kd-badge ${value}`}>{value}</small>
              ) : value}
            </p>
          </li>
        ))}
      </ul>

      <footer className="kd-modal-footer">
        <button className="kd-btn ghost" onClick={onClose}>Close</button>
      </footer>
    </article>
  </section>
);

/* ──────────────────────────────────────────
   STUDENTS PAGE
────────────────────────────────────────── */

const StudentsPage = () => {
  const [students, setStudents]       = useState(SEED_STUDENTS);
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingStudent, setViewingStudent] = useState(null);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.studentNo.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || s.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [students, search, filterStatus]);

  const toggleStatus = (id) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "active" ? "inactive" : "active" }
          : s
      )
    );
  };

  return (
    <section aria-label="Students management">
      <StatsRow items={[]} type="students" />

      <form
        className="kd-search-row"
        role="search"
        aria-label="Search and filter students"
        onSubmit={(e) => e.preventDefault()}
      >
        <section className="kd-search-wrap">
          <svg className="kd-search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="kd-search-input"
            type="search"
            placeholder="Search by name, email or number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search students"
          />
        </section>

        <ul className="kd-filter-list" aria-label="Student status filters">
          {["all", "active", "inactive", "pending"].map((f) => (
            <li key={f}>
              <button
                type="button"
                className={`kd-filter-pill ${filterStatus === f ? "active" : ""}`}
                onClick={() => setFilterStatus(f)}
                aria-pressed={filterStatus === f}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </form>

      <section className="kd-table-wrap" aria-label="Students table">
        <table className="kd-table">
          <thead>
            <tr>
              <th scope="col">Student name</th>
              <th scope="col">Student surname</th>
              <th scope="col">Student email</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <p className="kd-empty-state" role="status">No students match your search.</p>
                </td>
              </tr>
            )}
            {filtered.map((student) => (
              <tr key={student.id}>
                <td>
                  {student.name.split(" ")[0] || student.name}
                </td>
                <td>{student.name.split(" ").slice(1).join(" ") || "-"}</td>
                <td>{student.email}</td>
                <td>
                  <small className={`kd-badge ${student.status}`}>{student.status}</small>
                </td>
                <td>
                  <section className="kd-table-actions">
                    <button
                      className="kd-action-btn view"
                      onClick={() => setViewingStudent(student)}
                      aria-label={`View ${student.name}`}
                    >
                      View
                    </button>
                    <button
                      className={`kd-action-btn ${student.status === "active" ? "suspend" : "restore"}`}
                      onClick={() => toggleStatus(student.id)}
                      aria-label={`${student.status === "active" ? "Suspend" : "Restore"} ${student.name}`}
                    >
                      {student.status === "active" ? "Suspend" : "Restore"}
                    </button>
                  </section>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {viewingStudent && (
        <StudentModal
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
        />
      )}
    </section>
  );
};

/* ──────────────────────────────────────────
   VENDORS PAGE
────────────────────────────────────────── */

const VendorsPage = () => {
  const [vendors, setVendors]         = useState(SEED_VENDORS);
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingVendor, setViewingVendor] = useState(null);

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase()) ||
        v.vendorNo.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || v.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [vendors, search, filterStatus]);

  const toggleStatus = (id) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, status: v.status === "active" ? "inactive" : "active" }
          : v
      )
    );
  };

  return (
    <section aria-label="Vendors management">
      <StatsRow items={[]} type="vendors" />

      <form
        className="kd-search-row"
        role="search"
        aria-label="Search and filter vendors"
        onSubmit={(e) => e.preventDefault()}
      >
        <section className="kd-search-wrap">
          <svg className="kd-search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="kd-search-input"
            type="search"
            placeholder="Search by name, email or number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search vendors"
          />
        </section>

        <ul className="kd-filter-list" aria-label="Vendor status filters">
          {["all", "active", "inactive", "pending"].map((f) => (
            <li key={f}>
              <button
                type="button"
                className={`kd-filter-pill ${filterStatus === f ? "active" : ""}`}
                onClick={() => setFilterStatus(f)}
                aria-pressed={filterStatus === f}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </form>

      <section className="kd-table-wrap" aria-label="Vendors table">
        <table className="kd-table">
          <thead>
            <tr>
              <th scope="col">Vendor</th>
              <th scope="col">Vendor no.</th>
              <th scope="col">Category</th>
              <th scope="col">Items</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <p className="kd-empty-state" role="status">No vendors match your search.</p>
                </td>
              </tr>
            )}
            {filtered.map((vendor) => (
              <tr key={vendor.id}>
                <td>
                  <figure className="kd-cell-name">
                    <p className="kd-cell-avatar purple" aria-hidden="true">
                      {initials(vendor.name)}
                    </p>
                    <figcaption className="kd-cell-name-text">
                      <strong>{vendor.name}</strong>
                      <small className="kd-cell-subtext">{vendor.email}</small>
                    </figcaption>
                  </figure>
                </td>
                <td>{vendor.vendorNo}</td>
                <td>{vendor.category}</td>
                <td>{vendor.items}</td>
                <td>
                  <small className={`kd-badge ${vendor.status}`}>{vendor.status}</small>
                </td>
                <td>
                  <section className="kd-table-actions">
                    <button
                      className="kd-action-btn view"
                      onClick={() => setViewingVendor(vendor)}
                      aria-label={`View ${vendor.name}`}
                    >
                      View
                    </button>
                    <button
                      className={`kd-action-btn ${vendor.status === "active" ? "suspend" : "restore"}`}
                      onClick={() => toggleStatus(vendor.id)}
                      aria-label={`${vendor.status === "active" ? "Suspend" : "Restore"} ${vendor.name}`}
                    >
                      {vendor.status === "active" ? "Suspend" : "Restore"}
                    </button>
                  </section>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {viewingVendor && (
        <VendorModal
          vendor={viewingVendor}
          onClose={() => setViewingVendor(null)}
        />
      )}
    </section>
  );
};

/* ──────────────────────────────────────────
   PLACEHOLDER PAGE
────────────────────────────────────────── */

const PlaceholderPage = ({ label }) => (
  <section aria-label={`${label} placeholder`} className="kd-placeholder">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 9h6M9 13h4" />
    </svg>
    <strong>{label}</strong>
    <p>This section is not yet implemented.</p>
  </section>
);

/* ──────────────────────────────────────────
   NAV CONFIG
────────────────────────────────────────── */

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    id: "students",
    label: "Students",
    icon: (
      <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true">
        <path d="M12 3L2 8l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: "vendors",
    label: "Vendors",
    icon: (
      <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true">
        <path d="M3 9l9-6 9 6v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    id: "orders",
    label: "Orders",
    icon: (
      <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true">
        <path d="M6 2h12v20H6zM6 6h12" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: (
      <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true">
        <path d="M4 20V10M9 20V4M14 20v-6M19 20v-9" />
      </svg>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    icon: (
      <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M9 13h6M9 17h4" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" className="kd-icon" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

const PAGE_SUBTITLES = {
  overview:  "Platform at a glance",
  students:  "Manage registered students",
  vendors:   "Manage registered vendors",
  orders:    "View and manage all orders",
  analytics: "Platform usage and trends",
  reports:   "Generated reports",
  settings:  "System configuration",
};

/* ──────────────────────────────────────────
   ADMIN ROOT
────────────────────────────────────────── */

const Admin = () => {
  const [expanded, setExpanded] = useState(false);
  const [activeNav, setActiveNav] = useState("students");

  const renderPage = () => {
    switch (activeNav) {
      case "students":  return <StudentsPage />;
      case "vendors":   return <VendorsPage />;
      default:          return <PlaceholderPage label={NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? activeNav} />;
    }
  };

  return (
    <main className="kd-app">

      {/* SIDEBAR */}
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
                  {item.icon}
                  {expanded && <p className="kd-nav-text">{item.label}</p>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* MAIN */}
      <section className="kd-main">

        <header className="kd-topbar">
          <section>
            <h1 className="kd-page-title">
              {NAV_ITEMS.find((n) => n.id === activeNav)?.label}
            </h1>
            <p className="kd-page-sub">{PAGE_SUBTITLES[activeNav]}</p>
          </section>
          <figure className="kd-avatar" aria-label="Admin profile"></figure>
        </header>

        {renderPage()}

      </section>
    </main>
  );
};

export default Admin;
