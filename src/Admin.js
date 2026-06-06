import { useState } from "react";

const STATUS = {
  pending:   { color: "#B87333", bg: "rgba(184,115,51,0.15)",  label: "Pending"   },
  shipped:   { color: "#7aaad4", bg: "rgba(74,122,181,0.15)",  label: "Shipped"   },
  delivered: { color: "#70a870", bg: "rgba(80,128,80,0.15)",   label: "Delivered" },
  cancelled: { color: "#B04040", bg: "rgba(176,64,64,0.15)",   label: "Cancelled" },
};

function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function Admin() {
  const [pw, setPw]           = useState("");
  const [orders, setOrders]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter]   = useState("all");
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = async (password) => {
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.orders;
  };

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await fetchOrders(pw);
    setLoading(false);
    if (!result) { setError("Incorrect password."); return; }
    setOrders(result);
  };

  const refresh = async () => {
    setLoading(true);
    const result = await fetchOrders(pw);
    if (result) setOrders(result);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await fetch("/api/admin/update-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw, id, status }),
    });
    const result = await fetchOrders(pw);
    if (result) setOrders(result);
    setUpdating(null);
  };

  const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Montserrat:wght@400;500;600;700&display=swap');`;
  const BASE = `* { margin:0; padding:0; box-sizing:border-box; } body { background:#080808; }`;

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!orders) {
    return (
      <div style={{ fontFamily: "'Montserrat',sans-serif", background: "#080808", color: "#F0EFE8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{FONTS + BASE}</style>
        <form onSubmit={login} style={{ width: 340, padding: "48px 40px", border: "1px solid rgba(212,175,55,0.2)", background: "#0D0D0D" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 6, textAlign: "center" }}>ACE PEPTIDES</div>
          <div style={{ fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "#3A3A32", marginBottom: 36, textAlign: "center" }}>Admin</div>
          <label style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#D4AF37", fontWeight: 700, display: "block", marginBottom: 8 }}>Password</label>
          <input
            type="password" value={pw} onChange={(e) => setPw(e.target.value)} required autoFocus
            style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(212,175,55,0.3)", color: "#F0EFE8", padding: "10px 0", fontSize: 16, outline: "none", marginBottom: 28, fontFamily: "monospace" }}
          />
          {error && <div style={{ fontSize: 11, color: "#B04040", marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: 13, background: "linear-gradient(135deg,#9A7A1A,#D4AF37,#F5D07A)", color: "#000", border: "none", cursor: "pointer", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>
            {loading ? "…" : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const revenue  = orders.reduce((s, o) => s + Number(o.total_usd), 0);
  const pending  = orders.filter((o) => o.status === "pending").length;

  return (
    <div style={{ fontFamily: "'Montserrat',sans-serif", background: "#080808", color: "#F0EFE8", minHeight: "100vh" }}>
      <style>{FONTS + BASE + `
        .admin-btn { border:1px solid rgba(212,175,55,0.35); background:none; color:#D4AF37; padding:6px 14px; font-size:9px; letter-spacing:.14em; text-transform:uppercase; cursor:pointer; font-family:'Montserrat',sans-serif; font-weight:600; transition:background .2s,color .2s; }
        .admin-btn:hover:not(:disabled) { background:#D4AF37; color:#000; }
        .admin-btn:disabled { opacity:.35; cursor:default; }
        .admin-btn.danger { border-color:rgba(176,64,64,0.4); color:#B04040; }
        .admin-btn.danger:hover:not(:disabled) { background:#B04040; color:#fff; }
        .filter-btn { background:none; border:none; border-bottom:2px solid transparent; padding:9px 18px; font-size:10px; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; font-family:'Montserrat',sans-serif; font-weight:600; color:#4A4A42; transition:color .2s,border-color .2s; }
        .filter-btn.active { color:#D4AF37; border-bottom-color:#D4AF37; }
        .order-card { border:1px solid rgba(212,175,55,0.1); background:#0D0D0D; margin-bottom:2px; transition:border-color .2s; }
        .order-card:hover { border-color:rgba(212,175,55,0.22); }
      `}</style>

      {/* Header */}
      <div style={{ padding: "16px 32px", borderBottom: "1px solid rgba(212,175,55,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(8,8,8,0.96)", backdropFilter: "blur(12px)", zIndex: 10 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: "0.18em", color: "#D4AF37" }}>
          ACE PEPTIDES <span style={{ fontSize: 9, color: "#3A3A32", letterSpacing: "0.26em" }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={refresh} disabled={loading} className="admin-btn">{loading ? "…" : "↻ Refresh"}</button>
          <button onClick={() => { setOrders(null); setPw(""); }} style={{ background: "none", border: "none", color: "#3A3A32", cursor: "pointer", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", fontFamily: "'Montserrat',sans-serif" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, marginBottom: 32 }}>
          {[["Total Orders", orders.length], ["Awaiting Shipment", pending], ["Total Revenue", `$${revenue.toFixed(2)}`]].map(([label, val]) => (
            <div key={label} style={{ background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.1)", padding: "20px 24px" }}>
              <div style={{ fontSize: 9, color: "#4A4A42", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 28, color: "#D4AF37" }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(212,175,55,0.08)", marginBottom: 20 }}>
          {["all", "pending", "shipped", "delivered", "cancelled"].map((f) => (
            <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? `All (${orders.length})` : `${f[0].toUpperCase() + f.slice(1)} (${orders.filter((o) => o.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", fontSize: 12, color: "#3A3A32" }}>No orders.</div>
        ) : filtered.map((order) => {
          const sc   = STATUS[order.status] || STATUS.pending;
          const ship = order.shipping_info || {};
          const items = order.items || [];
          const open  = expanded === order.id;
          return (
            <div key={order.id} className="order-card">
              {/* Row header */}
              <div
                onClick={() => setExpanded(open ? null : order.id)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", cursor: "pointer", gap: 16, flexWrap: "wrap" }}
              >
                <div style={{ display: "flex", gap: 20, alignItems: "center", flex: 1, flexWrap: "wrap", minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: "#3A3A32", flexShrink: 0 }}>{fmtDate(order.created_at)}</div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14 }}>{ship.name || "—"}</div>
                  <div style={{ fontSize: 11, color: "#5A5A52" }}>{ship.email || ""}</div>
                </div>
                <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: "#D4AF37" }}>${Number(order.total_usd).toFixed(2)}</span>
                  <span style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, padding: "4px 10px", background: sc.bg, color: sc.color }}>{sc.label}</span>
                  <span style={{ color: "#3A3A32", fontSize: 11 }}>{open ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {open && (
                <div style={{ borderTop: "1px solid rgba(212,175,55,0.07)", padding: "22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}>
                  {/* Ship to */}
                  <div>
                    <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Ship To</div>
                    <div style={{ fontSize: 13, lineHeight: 1.85 }}>
                      <strong>{ship.name}</strong><br />
                      {ship.address}<br />
                      {ship.city}, {ship.state} {ship.zip}<br />
                      {ship.country}
                    </div>
                    <div style={{ fontSize: 11, color: "#5A5A52", marginTop: 6 }}>{ship.email}</div>
                  </div>

                  {/* Items */}
                  <div>
                    <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Items</div>
                    {items.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: "#C0BFB8" }}>{item.name} ×{item.qty}</span>
                        <span style={{ color: "#D4AF37" }}>${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: "1px solid rgba(212,175,55,0.08)", paddingTop: 8, marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "#4A4A42" }}>Total</span>
                      <span style={{ color: "#D4AF37", fontWeight: 700 }}>${Number(order.total_usd).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment + Actions */}
                  <div>
                    <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Payment</div>
                    <div style={{ fontSize: 10, color: "#5A5A52", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>{order.payment_method}</div>
                    {order.payment_ref && (
                      <a href={`https://etherscan.io/tx/${order.payment_ref}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 10, color: "#D4AF37", fontFamily: "monospace", wordBreak: "break-all" }}>
                        {order.payment_ref.slice(0, 20)}…
                      </a>
                    )}

                    <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 8 }}>
                      {order.status === "pending" && (
                        <button className="admin-btn" disabled={updating === order.id} onClick={() => updateStatus(order.id, "shipped")}>
                          {updating === order.id ? "…" : "✓ Mark Shipped"}
                        </button>
                      )}
                      {order.status === "shipped" && (
                        <button className="admin-btn" disabled={updating === order.id} onClick={() => updateStatus(order.id, "delivered")}>
                          {updating === order.id ? "…" : "✓ Mark Delivered"}
                        </button>
                      )}
                      {order.status !== "cancelled" && (
                        <button className="admin-btn danger" disabled={updating === order.id} onClick={() => updateStatus(order.id, "cancelled")}>
                          {updating === order.id ? "…" : "Cancel Order"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
