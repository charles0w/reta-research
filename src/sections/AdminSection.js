import { useState, useEffect } from "react";

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtMethod(m) {
  const map = { card: "Card", cash_app: "Cash App", eth: "ETH", card_subscription: "Sub (Card)" };
  return map[m] || m;
}

export default function AdminSection() {
  const [key, setKey]       = useState("");
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [tab, setTab]       = useState("orders");

  const tryFetch = async (k) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/get-orders", { headers: { Authorization: `Bearer ${k}` } });
      if (!r.ok) throw new Error("Incorrect password");
      const d = await r.json();
      setData(d);
      sessionStorage.setItem("ace-admin-key", k);
    } catch (e) {
      setError(e.message);
      sessionStorage.removeItem("ace-admin-key");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("ace-admin-key");
    if (saved) { setKey(saved); tryFetch(saved); }
  }, []); // eslint-disable-line

  const orders = data?.orders || [];
  const subs   = data?.subscriptions || [];
  const revenue = orders.filter(o => o.status === "confirmed" || o.status === "sent")
    .reduce((s, o) => s + (o.total_usd || 0), 0);

  if (!data) {
    return (
      <div style={{ maxWidth: 400, margin: "100px auto", padding: "0 24px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8, fontFamily: "var(--font-sans)" }}>Admin</div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, letterSpacing: "0.06em", marginBottom: 32 }}>Order Dashboard</h1>
        <input
          type="password"
          placeholder="Admin password"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === "Enter" && tryFetch(key)}
          style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(212,175,55,0.3)", color: "var(--text)", padding: "12px 0", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none", marginBottom: 20 }}
        />
        {error && <div style={{ fontSize: 12, color: "#c04040", marginBottom: 16 }}>{error}</div>}
        <button className="btn-gold" style={{ width: "100%", padding: 14 }} onClick={() => tryFetch(key)} disabled={loading}>
          {loading ? "Checking…" : "Enter"}
        </button>
      </div>
    );
  }

  const statCard = (label, value) => (
    <div style={{ flex: 1, border: "1px solid var(--border)", padding: "20px 24px", background: "var(--surface)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-secondary)", fontFamily: "var(--font-sans)", marginBottom: 10 }}>{label}</div>
      <div className="gold-text" style={{ fontFamily: "var(--font-serif)", fontSize: 28 }}>{value}</div>
    </div>
  );

  const activeOrders = orders.filter(o => o.status === "confirmed" || o.status === "sent");
  const activeSubs   = subs.filter(s => s.status === "active");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 0 120px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8, fontFamily: "var(--font-sans)" }}>Admin</div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 400, letterSpacing: "0.05em" }}>Order Dashboard</h1>
        </div>
        <button
          className="btn-outline"
          style={{ fontSize: 10, padding: "8px 16px" }}
          onClick={() => { setData(null); sessionStorage.removeItem("ace-admin-key"); }}
        >
          Sign out
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 2, marginBottom: 40, flexWrap: "wrap" }}>
        {statCard("Total revenue", `$${revenue.toFixed(2)}`)}
        {statCard("Orders", activeOrders.length)}
        {statCard("Active subscriptions", activeSubs.length)}
        {statCard("Failed subscriptions", subs.filter(s => s.status === "payment_failed").length)}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
        {[["orders", "Orders"], ["subscriptions", "Subscriptions"]].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              background: tab === k ? "var(--surface)" : "transparent",
              border: `1px solid ${tab === k ? "var(--border-hover)" : "var(--border)"}`,
              borderBottom: tab === k ? "1px solid var(--surface)" : "1px solid var(--border)",
              color: tab === k ? "var(--gold)" : "var(--text-secondary)",
              padding: "10px 24px",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
            }}
          >
            {label} ({k === "orders" ? orders.length : subs.length})
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
        {tab === "orders" && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Date", "Name", "Email", "Items", "Total", "Method", "Status", "Ref"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} style={{ borderBottom: i < orders.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={td}>{fmt(o.created_at)}</td>
                  <td style={td}>{o.shipping_info?.name || "—"}</td>
                  <td style={{ ...td, color: "var(--text-secondary)", fontSize: 11 }}>{o.shipping_info?.email || "—"}</td>
                  <td style={{ ...td, fontSize: 11, color: "var(--text-secondary)" }}>
                    {(o.items || []).map(it => `${it.name} ×${it.qty}`).join(", ")}
                  </td>
                  <td style={{ ...td, color: "var(--gold)", fontFamily: "var(--font-serif)" }}>${(o.total_usd || 0).toFixed(2)}</td>
                  <td style={td}>{fmtMethod(o.payment_method)}</td>
                  <td style={td}>
                    <span style={{
                      fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, padding: "3px 8px",
                      background: o.status === "confirmed" || o.status === "sent" ? "rgba(50,120,50,0.15)" : "rgba(120,50,50,0.15)",
                      color: o.status === "confirmed" || o.status === "sent" ? "#5a9a5a" : "#9a5a5a",
                    }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ ...td, fontSize: 9, color: "var(--text-muted)", fontFamily: "monospace", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.payment_ref}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {tab === "subscriptions" && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Created", "Name", "Email", "Product", "Tier", "Per Shipment", "Next Charge", "Status"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < subs.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={td}>{fmt(s.created_at)}</td>
                  <td style={td}>{s.shipping_info?.name || "—"}</td>
                  <td style={{ ...td, color: "var(--text-secondary)", fontSize: 11 }}>{s.shipping_info?.email || "—"}</td>
                  <td style={{ ...td, fontSize: 11 }}>{s.product_name}</td>
                  <td style={td}>{s.tier}</td>
                  <td style={{ ...td, color: "var(--gold)", fontFamily: "var(--font-serif)" }}>${(s.price_per_shipment || 0).toFixed(2)}</td>
                  <td style={td}>{s.next_charge_date || "—"}</td>
                  <td style={td}>
                    <span style={{
                      fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, padding: "3px 8px",
                      background: s.status === "active" ? "rgba(50,120,50,0.15)" : "rgba(120,50,50,0.15)",
                      color: s.status === "active" ? "#5a9a5a" : "#9a5a5a",
                    }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>No subscriptions yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const td = {
  padding: "14px 16px",
  fontSize: 12,
  color: "var(--text)",
  fontFamily: "var(--font-sans)",
};
