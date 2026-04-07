import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .kd-app {
    font-family: 'DM Sans', sans-serif;
    background: #0e0f0f;
    min-height: 100vh;
    color: #f0ede6;
  }

  .kd-sidebar {
    position: fixed;
    top: 0; left: 0;
    width: 220px;
    height: 100vh;
    background: #141515;
    border-right: 1px solid #1f2020;
    display: flex;
    flex-direction: column;
    padding: 24px 0;
    z-index: 100;
  }

  .kd-logo {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #e8a045;
    padding: 0 20px 24px;
    border-bottom: 1px solid #1f2020;
    letter-spacing: -0.5px;
  }

  .kd-logo span { color: #f0ede6; }

  .kd-nav { padding: 16px 0; flex: 1; }

  .kd-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    color: #666;
    font-size: 13.5px;
    cursor: pointer;
    transition: all 0.15s;
    border-left: 2px solid transparent;
  }

  .kd-nav-item:hover { color: #aaa; background: #161717; }
  .kd-nav-item.active { color: #e8a045; border-left-color: #e8a045; background: #1a1b1b; }

  .kd-logout {
    padding: 16px 20px;
    border-top: 1px solid #1f2020;
  }

  .kd-main {
    margin-left: 220px;
    padding: 32px;
    min-height: 100vh;
  }

  .kd-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .kd-page-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.5px;
    color: #f0ede6;
  }

  .kd-page-sub {
    font-size: 13px;
    color: #666;
    margin-top: 2px;
  }

  .kd-avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: #e8a045;
    color: #0e0f0f;
    font-weight: 700;
    font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
  }

  .kd-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }

  .kd-stat {
    background: #141515;
    border: 1px solid #1f2020;
    border-radius: 12px;
    padding: 20px;
  }

  .kd-stat-label {
    font-size: 11px;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
  }

  .kd-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 600;
    color: #f0ede6;
    letter-spacing: -1px;
  }

  .kd-stat-delta {
    font-size: 12px;
    color: #3d9e6b;
    margin-top: 4px;
  }

  .kd-stat-delta.neg { color: #c94b4b; }

  .kd-grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .kd-card {
    background: #141515;
    border: 1px solid #1f2020;
    border-radius: 12px;
    padding: 20px;
  }

  .kd-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #f0ede6;
    margin-bottom: 16px;
    letter-spacing: -0.2px;
  }

  .kd-order-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #1a1b1b;
  }

  .kd-order-item:last-child { border-bottom: none; }

  .kd-order-img {
    width: 40px; height: 40px;
    border-radius: 8px;
    background: #1f2020;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }

  .kd-order-name { font-size: 13.5px; color: #ddd; font-weight: 500; }
  .kd-order-vendor { font-size: 12px; color: #555; margin-top: 2px; }

  .kd-badge {
    margin-left: auto;
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 500;
  }

  .badge-ready { background: #0d3322; color: #3d9e6b; }
  .badge-prep { background: #2e2010; color: #e8a045; }
  .badge-received { background: #1a1b1b; color: #666; }
  .badge-missed { background: #2e1010; color: #c94b4b; }

  .kd-bar-wrap { margin-bottom: 12px; }
  .kd-bar-label {
    display: flex; justify-content: space-between;
    font-size: 12px; color: #666; margin-bottom: 5px;
  }
  .kd-bar-track {
    height: 6px; background: #1f2020; border-radius: 3px; overflow: hidden;
  }
  .kd-bar-fill {
    height: 100%; border-radius: 3px;
    transition: width 0.6s ease;
  }

  .kd-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .kd-table th {
    text-align: left; padding: 8px 12px;
    font-size: 11px; color: #555;
    text-transform: uppercase; letter-spacing: 0.6px;
    border-bottom: 1px solid #1a1b1b;
  }
  .kd-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #1a1b1b;
    color: #bbb;
  }
  .kd-table tr:last-child td { border-bottom: none; }
  .kd-table tr:hover td { background: #161717; }

  .kd-btn {
    padding: 7px 14px;
    border-radius: 8px;
    border: 1px solid #2a2b2b;
    background: transparent;
    color: #aaa;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .kd-btn:hover { background: #1f2020; color: #f0ede6; }
  .kd-btn.primary { background: #e8a045; color: #0e0f0f; border-color: #e8a045; font-weight: 600; }
  .kd-btn.primary:hover { background: #d4913c; }
  .kd-btn.danger { border-color: #3a1515; color: #c94b4b; }
  .kd-btn.danger:hover { background: #2e1010; }

  .kd-full { grid-column: 1 / -1; }

  .kd-menu-item {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 0; border-bottom: 1px solid #1a1b1b;
  }
  .kd-menu-item:last-child { border-bottom: none; }
  .kd-menu-thumb {
    width: 48px; height: 48px; border-radius: 10px;
    background: #1f2020; display: flex; align-items: center; justify-content: center; font-size: 22px;
  }
  .kd-menu-info { flex: 1; }
  .kd-menu-name { font-size: 13.5px; color: #ddd; font-weight: 500; }
  .kd-menu-desc { font-size: 12px; color: #555; margin-top: 2px; }
  .kd-menu-price { font-family: 'Syne', sans-serif; font-weight: 600; color: #e8a045; font-size: 15px; margin-right: 12px; }

  .kd-toggle {
    width: 36px; height: 20px; border-radius: 10px; cursor: pointer;
    transition: background 0.2s; position: relative; border: none; flex-shrink: 0;
  }
  .kd-toggle::after {
    content: ''; position: absolute; top: 3px; width: 14px; height: 14px;
    border-radius: 50%; background: white; transition: left 0.2s;
  }
  .kd-toggle.on { background: #e8a045; }
  .kd-toggle.on::after { left: 19px; }
  .kd-toggle.off { background: #333; }
  .kd-toggle.off::after { left: 3px; }

  .kd-chart {
    display: flex; align-items: flex-end; gap: 8px;
    height: 100px; padding-top: 8px;
  }
  .kd-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .kd-chart-bar {
    width: 100%; border-radius: 4px 4px 0 0;
    min-height: 4px; transition: height 0.4s;
  }
  .kd-chart-lbl { font-size: 10px; color: #555; }

  .kd-notification {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 12px 0; border-bottom: 1px solid #1a1b1b;
  }
  .kd-notification:last-child { border-bottom: none; }
  .kd-notif-dot {
    width: 8px; height: 8px; border-radius: 50%;
    margin-top: 5px; flex-shrink: 0;
  }
  .kd-notif-text { font-size: 13px; color: #bbb; line-height: 1.5; }
  .kd-notif-time { font-size: 11px; color: #555; margin-top: 3px; }

  .kd-user-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid #1a1b1b;
  }
  .kd-user-row:last-child { border-bottom: none; }
  .kd-user-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; flex-shrink: 0;
  }

  .kd-access-denied {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 60vh; gap: 12px; color: #555;
  }
  .kd-access-denied h2 { font-family: 'Syne', sans-serif; color: #c94b4b; font-size: 22px; }
`;

const NAV = {
  student: [
    { icon: "⊞", label: "Overview" },
    { icon: "🍽", label: "Browse Menu" },
    { icon: "📋", label: "My Orders" },
    { icon: "👤", label: "Profile" },
  ],
  vendor: [
    { icon: "⊞", label: "Overview" },
    { icon: "📋", label: "Orders" },
    { icon: "🍽", label: "My Menu" },
    { icon: "📊", label: "Analytics" },
  ],
  admin: [
    { icon: "⊞", label: "Overview" },
    { icon: "🏪", label: "Vendors" },
    { icon: "👥", label: "Users" },
    { icon: "📊", label: "Reports" },
  ],
};

const ROLE_META = {
  student: { initials: "TM", name: "Thabo Mokoena", sub: "Student · BSc Computer Science" },
  vendor:  { initials: "MG", name: "Matrix Grill",   sub: "Vendor · Food court, Level 1" },
  admin:   { initials: "AD", name: "Admin User",      sub: "Platform Administrator" },
};

const PAGE_TITLES = {
  student: { title: "My Dashboard",     sub: "Good afternoon, Thabo — 1 order is ready for pickup." },
  vendor:  { title: "Vendor Dashboard", sub: "You have 2 new orders waiting." },
  admin:   { title: "Admin Overview",   sub: "1 vendor pending approval." },
};

// ─── Student ────────────────────────────────────────────────────────────────
function StudentDashboard() {
  const orders = [
    { emoji: "🍔", name: "Beef Burger Meal", vendor: "Matrix Grill", status: "ready" },
    { emoji: "🥗", name: "Greek Salad",       vendor: "FreshBowl Co.", status: "prep" },
    { emoji: "☕", name: "Flat White",         vendor: "Kaldi Café",   status: "received" },
  ];
  const weekBars = [40, 65, 30, 80, 55, 90, 45];
  const days     = ["M","T","W","T","F","S","S"];
  const allergens = [
    { emoji: "🌾", label: "Gluten-free" },
    { emoji: "🥛", label: "Dairy-free" },
    { emoji: "🌿", label: "Vegan" },
    { emoji: "🥜", label: "Nut-free" },
  ];

  return (
    <>
      <div className="kd-stats">
        {[
          { label: "Orders this month", value: "14",   delta: "+3 this week" },
          { label: "Total spent",       value: "R482", delta: "+R120 this week" },
          { label: "Favourite vendor",  value: "Kaldi",delta: "6 orders" },
          { label: "Avg wait time",     value: "8m",   delta: "-2m vs last week" },
        ].map((s, i) => (
          <div className="kd-stat" key={i}>
            <div className="kd-stat-label">{s.label}</div>
            <div className="kd-stat-value">{s.value}</div>
            <div className="kd-stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="kd-grid2">
        <div className="kd-card">
          <div className="kd-card-title">Active orders</div>
          {orders.map((o, i) => (
            <div className="kd-order-item" key={i}>
              <div className="kd-order-img">{o.emoji}</div>
              <div>
                <div className="kd-order-name">{o.name}</div>
                <div className="kd-order-vendor">{o.vendor}</div>
              </div>
              <div className={`kd-badge badge-${o.status}`}>
                {o.status === "ready" ? "Ready" : o.status === "prep" ? "Preparing" : "Received"}
              </div>
            </div>
          ))}
        </div>

        <div className="kd-card">
          <div className="kd-card-title">Spending this week</div>
          <div className="kd-chart">
            {weekBars.map((h, i) => (
              <div className="kd-chart-col" key={i}>
                <div className="kd-chart-bar" style={{ height: h + "px", background: i === 5 ? "#e8a045" : "#1f2020" }} />
                <div className="kd-chart-lbl">{days[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {allergens.map((a, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5, background:"#1a1b1b", borderRadius:20, padding:"4px 10px", fontSize:12, color:"#888" }}>
                <span style={{ fontSize: 13 }}>{a.emoji}</span> {a.label}
              </div>
            ))}
          </div>
        </div>

        <div className="kd-card kd-full">
          <div className="kd-card-title">Order history</div>
          <table className="kd-table">
            <thead>
              <tr><th>Item</th><th>Vendor</th><th>Date</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {[
                ["Chicken Wrap", "Matrix Grill",  "3 Apr 2026", "R65", "completed"],
                ["Cappuccino",   "Kaldi Café",     "2 Apr 2026", "R35", "completed"],
                ["Vegan Bowl",   "FreshBowl Co.",  "1 Apr 2026", "R89", "completed"],
                ["Bunny Chow",   "Spice House",    "31 Mar 2026","R72", "completed"],
              ].map(([item, vendor, date, amt, status], i) => (
                <tr key={i}>
                  <td style={{ color:"#ddd" }}>{item}</td>
                  <td>{vendor}</td>
                  <td>{date}</td>
                  <td style={{ color:"#e8a045", fontFamily:"Syne, sans-serif" }}>{amt}</td>
                  <td><span className="kd-badge badge-ready">{status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Vendor ─────────────────────────────────────────────────────────────────
function VendorDashboard() {
  const [items, setItems] = useState([
    { emoji:"🍔", name:"Beef Burger Meal",  desc:"With chips & drink",        price:"R85", on:true  },
    { emoji:"🌮", name:"Chicken Taco",       desc:"Spicy, gluten-free wrap",   price:"R55", on:true  },
    { emoji:"🥗", name:"Greek Salad",        desc:"Vegan, nut-free",           price:"R60", on:false },
    { emoji:"🍟", name:"Loaded Fries",       desc:"Cheese, bacon, jalapeño",   price:"R45", on:true  },
  ]);

  const toggle = (i) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, on: !it.on } : it));

  const incomingOrders = [
    { id:"#1042", student:"Thabo M.",  items:"Burger + Taco",    time:"2 min ago",  status:"new"  },
    { id:"#1041", student:"Priya K.",  items:"Greek Salad",      time:"8 min ago",  status:"prep" },
    { id:"#1040", student:"Ryan S.",   items:"Loaded Fries x2",  time:"14 min ago", status:"ready"},
  ];

  const peakHours  = [5,15,30,80,95,70,40,20,10,8,45,90];
  const hourLabels = ["8","9","10","11","12","13","14","15","16","17","18","19"];

  return (
    <>
      <div className="kd-stats">
        {[
          { label:"Today's orders",  value:"38",     delta:"+12 vs yesterday"  },
          { label:"Revenue today",   value:"R2,840", delta:"+R490 vs yesterday"},
          { label:"Avg prep time",   value:"11m",    delta:"-1m this week"     },
          { label:"Items sold out",  value:"1",      delta:"of 8 menu items"   },
        ].map((s, i) => (
          <div className="kd-stat" key={i}>
            <div className="kd-stat-label">{s.label}</div>
            <div className="kd-stat-value">{s.value}</div>
            <div className="kd-stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="kd-grid2">
        <div className="kd-card">
          <div className="kd-card-title">Incoming orders</div>
          {incomingOrders.map((o, i) => (
            <div className="kd-order-item" key={i}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontFamily:"Syne, sans-serif", fontSize:13, color:"#e8a045" }}>{o.id}</span>
                  <span style={{ fontSize:13, color:"#ddd" }}>{o.student}</span>
                </div>
                <div style={{ fontSize:12, color:"#555", marginTop:2 }}>{o.items} · {o.time}</div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                {o.status === "new"  && <button className="kd-btn primary" style={{ fontSize:11 }}>Accept</button>}
                {o.status === "prep" && <button className="kd-btn" style={{ fontSize:11, color:"#e8a045", borderColor:"#2a2010" }}>Mark Ready</button>}
                {o.status === "ready"&& <span className="kd-badge badge-ready">Ready</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="kd-card">
          <div className="kd-card-title">Peak hours today</div>
          <div className="kd-chart" style={{ height:90 }}>
            {peakHours.map((h, i) => (
              <div className="kd-chart-col" key={i}>
                <div className="kd-chart-bar" style={{ height:(h/100)*80+"px", background: h>70 ? "#e8a045" : "#1f2020" }} />
                <div className="kd-chart-lbl">{hourLabels[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, fontSize:12, color:"#555" }}>Peak: 12:00 – 13:00 · 95 orders</div>
        </div>

        <div className="kd-card kd-full">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div className="kd-card-title" style={{ marginBottom:0 }}>Menu items</div>
            <button className="kd-btn primary">+ Add item</button>
          </div>
          {items.map((it, i) => (
            <div className="kd-menu-item" key={i}>
              <div className="kd-menu-thumb">{it.emoji}</div>
              <div className="kd-menu-info">
                <div className="kd-menu-name">{it.name}</div>
                <div className="kd-menu-desc">{it.desc}</div>
              </div>
              <div className="kd-menu-price">{it.price}</div>
              <button
                className={`kd-toggle ${it.on ? "on" : "off"}`}
                onClick={() => toggle(i)}
                title={it.on ? "Mark as sold out" : "Mark as available"}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Admin ───────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const vendors = [
    { name:"Matrix Grill",  initials:"MG", color:"#e8a045", orders:142, revenue:"R11,240", status:"active"    },
    { name:"Kaldi Café",    initials:"KC", color:"#3d9e6b", orders:98,  revenue:"R7,810",  status:"active"    },
    { name:"FreshBowl Co.", initials:"FB", color:"#5b8de8", orders:76,  revenue:"R6,120",  status:"active"    },
    { name:"Spice House",   initials:"SH", color:"#c94b4b", orders:0,   revenue:"R0",      status:"suspended" },
    { name:"Wrap Republic", initials:"WR", color:"#888",    orders:0,   revenue:"R0",      status:"pending"   },
  ];

  const compliance = [
    { label:"Allergen info complete",   pct:78, color:"#e8a045" },
    { label:"Vendors approved",         pct:60, color:"#3d9e6b" },
    { label:"Payment gateway active",   pct:80, color:"#5b8de8" },
  ];

  const recentActivity = [
    { color:"#e8a045", text:"Wrap Republic submitted vendor application",             time:"5 min ago" },
    { color:"#3d9e6b", text:"Kaldi Café updated their menu (4 items changed)",        time:"22 min ago"},
    { color:"#c94b4b", text:"Spice House account suspended by admin",                 time:"1h ago"    },
    { color:"#5b8de8", text:"New student registered: Amara Dube",                     time:"2h ago"    },
    { color:"#888",    text:"Analytics report exported (CSV) by treasurer",           time:"3h ago"    },
  ];

  return (
    <>
      <div className="kd-stats">
        {[
          { label:"Total orders today",     value:"316",    delta:"+44 vs yesterday" },
          { label:"Platform revenue",       value:"R25,170",delta:"+R3,200 this week"},
          { label:"Active vendors",         value:"3",      delta:"of 5 registered"  },
          { label:"Registered students",    value:"1,204",  delta:"+18 this week"    },
        ].map((s, i) => (
          <div className="kd-stat" key={i}>
            <div className="kd-stat-label">{s.label}</div>
            <div className="kd-stat-value">{s.value}</div>
            <div className="kd-stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="kd-grid2">
        <div className="kd-card">
          <div className="kd-card-title">Vendor management</div>
          {vendors.map((v, i) => (
            <div className="kd-user-row" key={i}>
              <div className="kd-user-avatar" style={{ background:v.color+"22", color:v.color }}>{v.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13.5, color:"#ddd", fontWeight:500 }}>{v.name}</div>
                <div style={{ fontSize:12, color:"#555" }}>{v.orders} orders · {v.revenue}</div>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <span className={`kd-badge ${v.status==="active" ? "badge-ready" : v.status==="suspended" ? "badge-missed" : "badge-received"}`}>
                  {v.status}
                </span>
                {v.status === "pending"   && <button className="kd-btn primary" style={{ fontSize:11 }}>Approve</button>}
                {v.status === "active"    && <button className="kd-btn danger"  style={{ fontSize:11 }}>Suspend</button>}
                {v.status === "suspended" && <button className="kd-btn"         style={{ fontSize:11 }}>Reinstate</button>}
              </div>
            </div>
          ))}
        </div>

        <div className="kd-card">
          <div className="kd-card-title">Platform health</div>
          {compliance.map((c, i) => (
            <div className="kd-bar-wrap" key={i}>
              <div className="kd-bar-label"><span>{c.label}</span><span style={{ color:"#ddd" }}>{c.pct}%</span></div>
              <div className="kd-bar-track">
                <div className="kd-bar-fill" style={{ width:c.pct+"%", background:c.color }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop:20 }}>
            <div className="kd-card-title">Recent activity</div>
            {recentActivity.map((a, i) => (
              <div className="kd-notification" key={i}>
                <div className="kd-notif-dot" style={{ background:a.color }} />
                <div>
                  <div className="kd-notif-text">{a.text}</div>
                  <div className="kd-notif-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="kd-card kd-full">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div className="kd-card-title" style={{ marginBottom:0 }}>Sales per vendor — this week</div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="kd-btn">Export CSV</button>
              <button className="kd-btn">Export PDF</button>
            </div>
          </div>
          <table className="kd-table">
            <thead>
              <tr><th>Vendor</th><th>Orders</th><th>Revenue</th><th>Avg order</th><th>Compliance</th></tr>
            </thead>
            <tbody>
              {[
                ["Matrix Grill",  "142","R11,240","R79","94%"],
                ["Kaldi Café",    "98", "R7,810", "R80","88%"],
                ["FreshBowl Co.", "76", "R6,120", "R81","100%"],
              ].map(([name,orders,rev,avg,comp], i) => (
                <tr key={i}>
                  <td style={{ color:"#ddd", fontWeight:500 }}>{name}</td>
                  <td>{orders}</td>
                  <td style={{ color:"#e8a045", fontFamily:"Syne, sans-serif" }}>{rev}</td>
                  <td>{avg}</td>
                  <td style={{ color: parseInt(comp)>=95 ? "#3d9e6b" : parseInt(comp)>=80 ? "#e8a045" : "#c94b4b" }}>{comp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Shell ───────────────────────────────────────────────────────────────────
export default function KuduDashboard() {
  const location = useLocation();
  const navigate  = useNavigate();

  // Login passes user via: navigate("/dashboard", { state: { role, name } })
  const user = location.state || {};
  const role = user.role; // "student" | "vendor" | "admin"

  const [activeNav, setActiveNav] = useState(0);

  const handleLogout = () => navigate("/", { replace: true });

  // Guard: if no role, redirect to login
  if (!role || !ROLE_META[role]) {
    return (
      <>
        <style>{styles}</style>
        <div className="kd-app">
          <div className="kd-access-denied">
            <h2>Access Denied</h2>
            <p>Please log in to view your dashboard.</p>
            <button className="kd-btn primary" onClick={handleLogout}>Go to Login</button>
          </div>
        </div>
      </>
    );
  }

  const meta = ROLE_META[role];
  const page = PAGE_TITLES[role];

  return (
    <>
      <style>{styles}</style>
      <div className="kd-app">
        <div className="kd-sidebar">
          <div className="kd-logo">Kudu<span>Dash</span></div>

          <nav className="kd-nav">
            {NAV[role].map((item, i) => (
              <div
                key={i}
                className={`kd-nav-item ${activeNav === i ? "active" : ""}`}
                onClick={() => setActiveNav(i)}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="kd-logout">
            <button className="kd-btn danger" style={{ width:"100%" }} onClick={handleLogout}>
              ← Log out
            </button>
          </div>
        </div>

        <main className="kd-main">
          <div className="kd-topbar">
            <div>
              <div className="kd-page-title">{page.title}</div>
              <div className="kd-page-sub">{page.sub}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:13, color:"#ddd", fontWeight:500 }}>{meta.name}</div>
                <div style={{ fontSize:11, color:"#555" }}>{meta.sub}</div>
              </div>
              <div className="kd-avatar">{meta.initials}</div>
            </div>
          </div>

          {role === "student" && <StudentDashboard />}
          {role === "vendor"  && <VendorDashboard />}
          {role === "admin"   && <AdminDashboard />}
        </main>
      </div>
    </>
  );
}
