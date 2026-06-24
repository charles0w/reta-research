import { useState, useEffect } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS = {
  pending:      { color: "#B87333", bg: "rgba(184,115,51,0.15)",  label: "Pending"   },
  shipped:      { color: "#7aaad4", bg: "rgba(74,122,181,0.15)",  label: "Shipped"   },
  delivered:    { color: "#70a870", bg: "rgba(80,128,80,0.15)",   label: "Delivered" },
  cancelled:    { color: "#B04040", bg: "rgba(176,64,64,0.15)",   label: "Cancelled" },
};

const STOCK = {
  in_stock:     { color: "#70a870", bg: "rgba(80,128,80,0.15)",   label: "In Stock"     },
  low:          { color: "#B87333", bg: "rgba(184,115,51,0.15)",  label: "Low Stock"    },
  out_of_stock: { color: "#B04040", bg: "rgba(176,64,64,0.15)",   label: "Out of Stock" },
};

// On-chain payment verification state (set by api/send-order.js + the cron).
// Only "Paid ✓" orders should be shipped.
const PAYMENT_STATUS = {
  verified:     { color: "#70a870", bg: "rgba(80,128,80,0.15)",   label: "Paid ✓"     },
  pending:      { color: "#B87333", bg: "rgba(184,115,51,0.15)",  label: "Verifying"  },
  unverified:   { color: "#7A7A72", bg: "rgba(122,122,114,0.15)", label: "Unverified" },
  mismatch:     { color: "#B04040", bg: "rgba(176,64,64,0.15)",   label: "Mismatch"   },
  expired:      { color: "#B04040", bg: "rgba(176,64,64,0.15)",   label: "Expired"    },
};

const TABS = ["orders", "customers", "inventory", "affiliates", "subscribers", "waitlist", "analytics"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDateShort(str) {
  return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function StatusBadge({ status, map = STATUS }) {
  const s = map[status] || { color: "#4A4A42", bg: "rgba(74,74,66,0.15)", label: status };
  return (
    <span style={{
      fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700,
      padding: "3px 9px", background: s.bg, color: s.color, whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
}

// ── CSS ──────────────────────────────────────────────────────────────────────

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Montserrat:wght@400;500;600;700&display=swap');`;

const CSS = `
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#080808; }
.btn-gold {
  background: linear-gradient(135deg,#9A7A1A,#D4AF37,#F5D07A); color:#000;
  border:none; cursor:pointer; transition:opacity .2s;
}
.btn-gold:hover:not(:disabled) { opacity:0.88; }
.btn-gold:disabled { opacity:.4; cursor:default; }
.admin-btn {
  border:1px solid rgba(212,175,55,0.35); background:none; color:#D4AF37;
  padding:6px 14px; font-size:9px; letter-spacing:.14em; text-transform:uppercase;
  cursor:pointer; font-family:'Montserrat',sans-serif; font-weight:600;
  transition:background .2s,color .2s;
}
.admin-btn:hover:not(:disabled) { background:#D4AF37; color:#000; }
.admin-btn:disabled { opacity:.35; cursor:default; }
.admin-btn.danger { border-color:rgba(176,64,64,0.4); color:#B04040; }
.admin-btn.danger:hover:not(:disabled) { background:#B04040; color:#fff; }
.admin-btn.active-stock { background:linear-gradient(135deg,#9A7A1A,#D4AF37); color:#000; border-color:#D4AF37; }
.filter-btn {
  background:none; border:none; border-bottom:2px solid transparent;
  padding:9px 18px; font-size:10px; letter-spacing:.12em; text-transform:uppercase;
  cursor:pointer; font-family:'Montserrat',sans-serif; font-weight:600;
  color:#4A4A42; transition:color .2s,border-color .2s; white-space:nowrap;
}
.filter-btn.active { color:#D4AF37; border-bottom-color:#D4AF37; }
.row-card { border:1px solid rgba(212,175,55,0.1); background:#0D0D0D; margin-bottom:2px; transition:border-color .2s; }
.row-card:hover { border-color:rgba(212,175,55,0.22); }
.tab-nav-btn {
  background:none; border:none; border-bottom:2px solid transparent;
  padding:12px 22px; font-size:10px; letter-spacing:.15em; text-transform:uppercase;
  cursor:pointer; font-family:'Montserrat',sans-serif; font-weight:600;
  color:#4A4A42; transition:color .2s,border-color .2s; white-space:nowrap;
}
.tab-nav-btn.active { color:#D4AF37; border-bottom-color:#D4AF37; }
.stat-card { background:#0D0D0D; border:1px solid rgba(212,175,55,0.1); padding:20px 24px; }
.section-label { font-size:9px; color:#4A4A42; letter-spacing:.18em; text-transform:uppercase; margin-bottom:8px; }
.gold { color:#D4AF37; }
.cinzel { font-family:'Cinzel',serif; }
.bar-hover:hover .bar-tooltip { display:block; }
.bar-tooltip { display:none; position:absolute; bottom:calc(100% + 4px); left:50%; transform:translateX(-50%);
  background:#1A1A10; border:1px solid rgba(212,175,55,0.3); color:#D4AF37; font-size:9px;
  padding:3px 7px; white-space:nowrap; pointer-events:none; z-index:5; }
@media (max-width:700px) {
  .stats-grid-3 { grid-template-columns:1fr!important; }
  .stats-grid-5 { grid-template-columns:1fr 1fr!important; }
  .detail-grid-3 { grid-template-columns:1fr!important; }
  .tab-nav-btn { padding:10px 12px; font-size:9px; }
  .filter-btn { padding:8px 10px; font-size:9px; }
}
`;

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="section-label">{label}</div>
      <div className="cinzel gold" style={{ fontSize: 26 }}>{value}</div>
    </div>
  );
}

// ── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({ orders, token, updating, setUpdating, setOrders, loadTab }) {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [shippingOrder, setShippingOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState("");

  const revenue  = orders.reduce((s, o) => s + Number(o.total_usd), 0);
  const pending  = orders.filter((o) => o.status === "pending").length;
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  // Subscription renewals are manual (orders are one-time discounted purchases),
  // so surface when each subscriber's next shipment is due. Cadence comes from
  // the sub line-item id: sub-<tier>-<productId>.
  const CADENCE_DAYS = { quarterly: 90, bimonthly: 60, monthly: 30 };
  const now = Date.now();
  const renewals = orders
    .filter((o) => o.status !== "cancelled" && !["mismatch", "expired"].includes(o.payment_status))
    .flatMap((o) =>
      (o.items || [])
        .filter((it) => typeof it.id === "string" && it.id.startsWith("sub-"))
        .map((it) => {
          const tier = it.id.split("-")[1];
          const due = new Date(o.created_at).getTime() + (CADENCE_DAYS[tier] || 30) * 86400000;
          return {
            key: `${o.id}-${it.id}`,
            customer: o.shipping_info?.name || "—",
            email: o.shipping_info?.email,
            product: it.name,
            due,
            overdue: due < now,
            dueSoon: due - now < 7 * 86400000,
          };
        })
    )
    .sort((a, b) => a.due - b.due);

  const updateStatus = async (id, status, trackingNumber) => {
    setUpdating(id);
    await fetch("/api/admin/update-order", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status, tracking_number: trackingNumber || undefined }),
    });
    const result = await loadTab("orders", token);
    if (result) setOrders(result);
    setUpdating(null);
  };

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, marginBottom: 28 }}>
        <StatCard label="Total Orders" value={orders.length} />
        <StatCard label="Awaiting Shipment" value={pending} />
        <StatCard label="Total Revenue" value={fmtMoney(revenue)} />
      </div>

      {/* Subscription renewals — manual follow-ups, soonest first */}
      {renewals.length > 0 && (
        <div style={{ background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.14)", padding: "20px 24px", marginBottom: 28 }}>
          <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700, marginBottom: 14 }}>
            Subscription Renewals ({renewals.length})
          </div>
          {renewals.map((r) => (
            <div key={r.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "9px 0", borderBottom: "1px solid rgba(212,175,55,0.06)", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "baseline", flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "#F0EFE8" }}>{r.customer}</span>
                <span style={{ fontSize: 11, color: "#5A5A52" }}>{r.product}</span>
                {r.email && <a href={`mailto:${r.email}`} style={{ fontSize: 10, color: "#4A4A42" }}>{r.email}</a>}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: r.overdue ? "#B04040" : r.dueSoon ? "#B87333" : "#4A4A42" }}>
                {r.overdue ? "Overdue — " : "Due "}{fmtDateShort(new Date(r.due).toISOString())}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(212,175,55,0.08)", marginBottom: 20, overflowX: "auto" }}>
        {["all", "pending", "shipped", "delivered", "cancelled"].map((f) => (
          <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? `All (${orders.length})` : `${f[0].toUpperCase() + f.slice(1)} (${orders.filter((o) => o.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", fontSize: 12, color: "#3A3A32" }}>No orders.</div>
      ) : filtered.map((order) => {
        const ship  = order.shipping_info || {};
        const items = order.items || [];
        const open  = expanded === order.id;
        return (
          <div key={order.id} className="row-card">
            <div
              onClick={() => setExpanded(open ? null : order.id)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", cursor: "pointer", gap: 16, flexWrap: "wrap" }}
            >
              <div style={{ display: "flex", gap: 20, alignItems: "center", flex: 1, flexWrap: "wrap", minWidth: 0 }}>
                <div style={{ fontSize: 10, color: "#3A3A32", flexShrink: 0 }}>{fmtDate(order.created_at)}</div>
                <div className="cinzel" style={{ fontSize: 14 }}>{ship.name || "—"}</div>
                <div style={{ fontSize: 11, color: "#5A5A52" }}>{ship.email || ""}</div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0 }}>
                <span className="cinzel gold" style={{ fontSize: 16 }}>{fmtMoney(order.total_usd)}</span>
                {order.payment_status && <StatusBadge status={order.payment_status} map={PAYMENT_STATUS} />}
                <StatusBadge status={order.status} />
                <span style={{ color: "#3A3A32", fontSize: 11 }}>{open ? "▲" : "▼"}</span>
              </div>
            </div>

            {open && (
              <div className="detail-grid-3" style={{ borderTop: "1px solid rgba(212,175,55,0.07)", padding: "22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}>
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
                      <span className="gold">{fmtMoney(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid rgba(212,175,55,0.08)", paddingTop: 8, marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#4A4A42" }}>Total</span>
                    <span className="gold" style={{ fontWeight: 700 }}>{fmtMoney(order.total_usd)}</span>
                  </div>
                </div>

                {/* Payment + Actions */}
                <div>
                  <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Payment</div>
                  <div style={{ fontSize: 10, color: "#5A5A52", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>{order.payment_method}</div>
                  {order.payment_status && (
                    <div style={{ marginBottom: 8 }}>
                      <StatusBadge status={order.payment_status} map={PAYMENT_STATUS} />
                    </div>
                  )}
                  {order.payment_ref && (
                    <a href={`https://etherscan.io/tx/${order.payment_ref}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 10, color: "#D4AF37", fontFamily: "monospace", wordBreak: "break-all" }}>
                      {order.payment_ref.slice(0, 20)}…
                    </a>
                  )}
                  {order.buyer_address && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Paid From</div>
                      <a href={`https://etherscan.io/address/${order.buyer_address}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: "#C0BFB8", fontFamily: "monospace", wordBreak: "break-all" }}>
                        {order.buyer_address}
                      </a>
                    </div>
                  )}
                  {order.promo_code && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Promo Code</div>
                      <div style={{ fontSize: 12, color: "#F0EFE8", fontFamily: "monospace", letterSpacing: ".06em" }}>{order.promo_code}</div>
                    </div>
                  )}
                  {order.tracking_number && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Tracking</div>
                      <div style={{ fontSize: 12, color: "#F0EFE8", fontFamily: "monospace", wordBreak: "break-all" }}>{order.tracking_number}</div>
                    </div>
                  )}
                  <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 8 }}>
                    {order.payment_status && order.payment_status !== "verified" && order.status === "pending" && (
                      <div style={{ fontSize: 10, color: "#B04040", lineHeight: 1.5 }}>
                        ⚠ Payment not verified — confirm on Etherscan before shipping.
                      </div>
                    )}
                    {order.status === "pending" && (
                      shippingOrder === order.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <input
                            type="text"
                            placeholder="Tracking # (optional)"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(212,175,55,0.3)", color: "#F0EFE8", padding: "6px 0", fontSize: 12, outline: "none", fontFamily: "monospace" }}
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="admin-btn" disabled={updating === order.id}
                              onClick={() => { updateStatus(order.id, "shipped", trackingInput); setShippingOrder(null); setTrackingInput(""); }}>
                              {updating === order.id ? "…" : "Confirm Ship"}
                            </button>
                            <button className="admin-btn" onClick={() => { setShippingOrder(null); setTrackingInput(""); }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button className="admin-btn" disabled={updating === order.id}
                          onClick={() => setShippingOrder(order.id)}>
                          {updating === order.id ? "…" : "✓ Mark Shipped"}
                        </button>
                      )
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
  );
}

// ── Customers Tab ────────────────────────────────────────────────────────────

function CustomersTab({ customers }) {
  const [sort, setSort]     = useState("spent");
  const [expanded, setExpanded] = useState(null);

  const sorted = [...customers].sort((a, b) => {
    if (sort === "spent")   return Number(b.total_spent) - Number(a.total_spent);
    if (sort === "orders")  return (b.orders?.length || 0) - (a.orders?.length || 0);
    if (sort === "recent")  return new Date(b.last_order_date) - new Date(a.last_order_date);
    return 0;
  });

  const total   = customers.length;
  const repeat  = customers.filter((c) => (c.orders?.length || 0) > 1).length;
  const revenue = customers.reduce((s, c) => s + Number(c.total_spent || 0), 0);

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, marginBottom: 28 }}>
        <StatCard label="Total Customers" value={total} />
        <StatCard label="Repeat Customers" value={repeat} />
        <StatCard label="Total Revenue" value={fmtMoney(revenue)} />
      </div>

      {/* Sort */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <span style={{ fontSize: 9, color: "#4A4A42", letterSpacing: ".14em", textTransform: "uppercase" }}>Sort By</span>
        {[["spent", "Total Spent"], ["orders", "# Orders"], ["recent", "Recent"]].map(([key, label]) => (
          <button key={key} className={`filter-btn ${sort === key ? "active" : ""}`} style={{ padding: "6px 14px" }} onClick={() => setSort(key)}>{label}</button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", fontSize: 12, color: "#3A3A32" }}>No customers.</div>
      ) : sorted.map((cust) => {
        const open = expanded === cust.email;
        const orders = cust.orders || [];
        return (
          <div key={cust.email} className="row-card">
            <div
              onClick={() => setExpanded(open ? null : cust.email)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", cursor: "pointer", gap: 16, flexWrap: "wrap" }}
            >
              <div style={{ display: "flex", gap: 20, alignItems: "center", flex: 1, flexWrap: "wrap", minWidth: 0 }}>
                <div className="cinzel" style={{ fontSize: 14 }}>{cust.name || "—"}</div>
                <div style={{ fontSize: 11, color: "#5A5A52" }}>{cust.email}</div>
              </div>
              <div style={{ display: "flex", gap: 18, alignItems: "center", flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <div className="cinzel gold" style={{ fontSize: 16 }}>{fmtMoney(cust.total_spent)}</div>
                  <div style={{ fontSize: 9, color: "#4A4A42", marginTop: 2 }}>{orders.length} order{orders.length !== 1 ? "s" : ""}</div>
                </div>
                {cust.last_order_date && (
                  <div style={{ fontSize: 9, color: "#3A3A32", textAlign: "right" }}>
                    Last:<br />{fmtDateShort(cust.last_order_date)}
                  </div>
                )}
                <span style={{ color: "#3A3A32", fontSize: 11 }}>{open ? "▲" : "▼"}</span>
              </div>
            </div>

            {open && (
              <div style={{ borderTop: "1px solid rgba(212,175,55,0.07)", padding: "22px 22px" }}>
                {/* Address */}
                {cust.address && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>Address</div>
                    <div style={{ fontSize: 12, color: "#C0BFB8", lineHeight: 1.8 }}>
                      {cust.address}<br />
                      {cust.city}{cust.state ? `, ${cust.state}` : ""} {cust.zip}<br />
                      {cust.country}
                    </div>
                  </div>
                )}

                {/* Orders */}
                <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Order History</div>
                {orders.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#3A3A32" }}>No orders.</div>
                ) : orders.map((o, i) => {
                  const items = o.items || [];
                  return (
                    <div key={i} style={{ background: "#111", border: "1px solid rgba(212,175,55,0.07)", padding: "12px 16px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ fontSize: 10, color: "#3A3A32" }}>{fmtDateShort(o.created_at)}</div>
                        <div style={{ fontSize: 11, color: "#C0BFB8" }}>{items.map((it) => `${it.name} ×${it.qty}`).join(", ")}</div>
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
                        <span className="cinzel gold" style={{ fontSize: 13 }}>{fmtMoney(o.total_usd)}</span>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Inventory Tab ────────────────────────────────────────────────────────────

function InventoryTab({ inventory, token, updating, setUpdating, setInventory, loadTab }) {
  const products = inventory || [];
  const [qtyInputs, setQtyInputs] = useState({});
  const [savingQty, setSavingQty] = useState(null);

  // Sync input fields when inventory loads
  useState(() => {
    const map = {};
    for (const p of products) map[p.product_id] = p.quantity ?? 0;
    setQtyInputs(map);
  }, [inventory]);

  const postInventory = async (body) => {
    await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const result = await loadTab("inventory", token);
    if (result) setInventory(result);
  };

  const changeStock = async (product_id, stock_status) => {
    setUpdating(product_id);
    await postInventory({ product_id, stock_status });
    setUpdating(null);
  };

  const saveQuantity = async (product_id) => {
    setSavingQty(product_id);
    const qty = Math.max(0, parseInt(qtyInputs[product_id]) || 0);
    await postInventory({ product_id, quantity: qty });
    setSavingQty(null);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
        {products.map((prod) => {
          const s = STOCK[prod.stock_status] || STOCK.out_of_stock;
          return (
            <div key={prod.product_id} style={{ background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.12)", padding: "28px 24px" }}>
              {/* Product name + status badge */}
              <div className="cinzel" style={{ fontSize: 15, marginBottom: 10 }}>{prod.product_name || prod.name}</div>
              <span style={{ fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, padding: "4px 10px", background: s.bg, color: s.color }}>{s.label}</span>

              {/* Big quantity counter */}
              <div style={{ margin: "22px 0 6px", display: "flex", alignItems: "baseline", gap: 8 }}>
                <div className="cinzel gold" style={{ fontSize: 56, lineHeight: 1 }}>{prod.quantity ?? 0}</div>
                <div style={{ fontSize: 9, color: "#4A4A42", letterSpacing: ".14em", textTransform: "uppercase" }}>units</div>
              </div>
              <div style={{ fontSize: 9, color: "#3A3A32", letterSpacing: ".10em", marginBottom: 18 }}>
                decrements automatically on each order
              </div>

              {/* Set quantity input */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 22, paddingBottom: 22, borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                <input
                  type="number" min="0"
                  value={qtyInputs[prod.product_id] ?? prod.quantity ?? 0}
                  onChange={(e) => setQtyInputs((q) => ({ ...q, [prod.product_id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                  style={{
                    flex: 1, background: "transparent", border: "none",
                    borderBottom: "1px solid rgba(212,175,55,0.3)", color: "#F0EFE8",
                    padding: "6px 0", fontFamily: "'Cinzel',serif", fontSize: 18,
                    outline: "none", MozAppearance: "textfield",
                  }}
                />
                <button
                  className="admin-btn"
                  disabled={savingQty === prod.product_id}
                  onClick={() => saveQuantity(prod.product_id)}
                >
                  {savingQty === prod.product_id ? "…" : "Set"}
                </button>
              </div>

              {/* Stock status buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[["in_stock", "In Stock"], ["low", "Low Stock"], ["out_of_stock", "Out of Stock"]].map(([key, label]) => (
                  <button
                    key={key}
                    className={`admin-btn${prod.stock_status === key ? " active-stock" : ""}`}
                    disabled={updating === prod.product_id || prod.stock_status === key}
                    onClick={() => changeStock(prod.product_id, key)}
                  >
                    {updating === prod.product_id ? "…" : label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: "#3A3A32", letterSpacing: ".12em" }}>
        Stock status changes reflect on the store within 30 seconds.
      </div>
    </div>
  );
}

// ── Subscribers Tab ──────────────────────────────────────────────────────────

function SubscribersTab({ subscribers }) {
  const list = subscribers || [];
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <StatCard label="Total Subscribers" value={list.length} />
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", fontSize: 12, color: "#3A3A32" }}>No subscribers yet.</div>
      ) : (
        <div style={{ background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.1)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "10px 20px", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
            {["Email", "Source", "Date Joined"].map((h) => (
              <div key={h} style={{ fontSize: 8, color: "#4A4A42", letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700 }}>{h}</div>
            ))}
          </div>
          {list.map((sub, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
              padding: "13px 20px",
              borderBottom: i < list.length - 1 ? "1px solid rgba(212,175,55,0.05)" : "none",
            }}>
              <div style={{ fontSize: 12, color: "#C0BFB8", wordBreak: "break-all" }}>{sub.email}</div>
              <div style={{ fontSize: 10, color: "#5A5A52", textTransform: "uppercase", letterSpacing: ".1em" }}>{sub.source || "—"}</div>
              <div style={{ fontSize: 10, color: "#4A4A42" }}>{sub.created_at ? fmtDateShort(sub.created_at) : "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Waitlist Tab ─────────────────────────────────────────────────────────────

function WaitlistTab({ waitlist }) {
  const list = waitlist || [];
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <StatCard label="Waitlist Signups" value={list.length} />
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", fontSize: 12, color: "#3A3A32" }}>No waitlist signups yet.</div>
      ) : (
        <div style={{ background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.1)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr", padding: "10px 20px", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
            {["Email", "Product", "Date Joined"].map((h) => (
              <div key={h} style={{ fontSize: 8, color: "#4A4A42", letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700 }}>{h}</div>
            ))}
          </div>
          {list.map((row, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr",
              padding: "13px 20px",
              borderBottom: i < list.length - 1 ? "1px solid rgba(212,175,55,0.05)" : "none",
            }}>
              <div style={{ fontSize: 12, color: "#C0BFB8", wordBreak: "break-all" }}>{row.email}</div>
              <div style={{ fontSize: 11, color: "#5A5A52" }}>{row.product || "Any / not sure"}</div>
              <div style={{ fontSize: 10, color: "#4A4A42" }}>{row.created_at ? fmtDateShort(row.created_at) : "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ analytics }) {
  const a = analytics || {};

  const thisMonth  = Number(a.this_month_revenue  || 0);
  const lastMonth  = Number(a.last_month_revenue  || 0);
  const totalRev   = Number(a.total_revenue       || 0);
  const avgOrder   = Number(a.avg_order_value     || 0);
  const totalOrds  = Number(a.total_orders        || 0);

  const momPct = lastMonth === 0 ? null : ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1);
  const momUp  = momPct > 0;

  const products    = a.product_breakdown || [];
  const statusBreak = a.status_breakdown  || {};
  const payBreak    = a.payment_breakdown || {};
  const daily       = a.daily_revenue     || [];

  // Last 14 days max
  const dailySlice = daily.slice(-14);
  const maxDay = Math.max(...dailySlice.map((d) => Number(d.revenue || 0)), 1);

  return (
    <div>
      {/* KPI row */}
      <div className="stats-grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 2, marginBottom: 28 }}>
        <StatCard label="Total Revenue"    value={fmtMoney(totalRev)} />
        <StatCard label="This Month"       value={fmtMoney(thisMonth)} />
        <StatCard label="Last Month"       value={fmtMoney(lastMonth)} />
        <StatCard label="Avg Order Value"  value={fmtMoney(avgOrder)} />
        <StatCard label="Total Orders"     value={totalOrds} />
      </div>

      {/* MoM indicator */}
      {momPct !== null && (
        <div style={{ background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.1)", padding: "14px 22px", marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 9, color: "#4A4A42", letterSpacing: ".16em", textTransform: "uppercase" }}>Month-over-Month</span>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 20, color: momUp ? "#70a870" : "#B04040", fontWeight: 700 }}>
            {momUp ? "▲" : "▼"} {Math.abs(momPct)}%
          </span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Product Breakdown */}
        <div style={{ background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.1)", padding: "22px" }}>
          <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Product Breakdown</div>
          {products.length === 0 ? (
            <div style={{ fontSize: 11, color: "#3A3A32" }}>No data.</div>
          ) : [...products].sort((a, b) => Number(b.revenue) - Number(a.revenue)).map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "#C0BFB8" }}>{p.name}</div>
                <div style={{ fontSize: 9, color: "#4A4A42" }}>{p.units_sold} units</div>
              </div>
              <div className="cinzel gold" style={{ fontSize: 14 }}>{fmtMoney(p.revenue)}</div>
            </div>
          ))}
        </div>

        {/* Payment Split + Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.1)", padding: "22px", flex: 1 }}>
            <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 14 }}>Payment Split</div>
            <div style={{ display: "flex", gap: 28 }}>
              {Object.entries(payBreak).map(([method, count]) => (
                <div key={method}>
                  <div style={{ fontSize: 8, color: "#4A4A42", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 4 }}>{method}</div>
                  <div className="cinzel gold" style={{ fontSize: 22 }}>{count}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.1)", padding: "22px", flex: 1 }}>
            <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 14 }}>Order Status</div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {Object.entries(statusBreak).map(([status, count]) => {
                const s = STATUS[status] || { color: "#4A4A42", label: status };
                return (
                  <div key={status}>
                    <div style={{ fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: s.color, marginBottom: 4 }}>{s.label}</div>
                    <div className="cinzel" style={{ fontSize: 22, color: "#F0EFE8" }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Revenue Bar Chart */}
      <div style={{ background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.1)", padding: "22px" }}>
        <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 20 }}>
          Daily Revenue — Last 30 Days
        </div>
        {dailySlice.length === 0 ? (
          <div style={{ fontSize: 11, color: "#3A3A32" }}>No data.</div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, overflowX: "auto", paddingBottom: 28 }}>
            {dailySlice.map((d, i) => {
              const rev   = Number(d.revenue || 0);
              const pct   = (rev / maxDay) * 100;
              const label = new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return (
                <div
                  key={i}
                  className="bar-hover"
                  style={{ flex: 1, minWidth: 18, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", height: "100%", justifyContent: "flex-end" }}
                >
                  <div className="bar-tooltip">{fmtMoney(rev)}</div>
                  <div
                    style={{
                      width: "80%",
                      height: `${pct}%`,
                      minHeight: rev > 0 ? 3 : 0,
                      background: "linear-gradient(180deg,#F5D07A,#9A7A1A)",
                      transition: "height .3s",
                    }}
                  />
                  <div style={{
                    position: "absolute", bottom: -24, fontSize: 7, color: "#3A3A32",
                    whiteSpace: "nowrap", transform: "rotate(-40deg)", transformOrigin: "top center",
                  }}>{label}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

const ENDPOINTS = {
  orders:      "/api/admin/orders",
  customers:   "/api/admin/customers",
  analytics:   "/api/admin/analytics",
  subscribers: "/api/admin/subscribers",
  waitlist:    "/api/admin/waitlist",
  inventory:   "/api/admin/inventory",
  affiliates:  "/api/admin/affiliate-codes",
};

async function fetchTab(tabName, token) {
  try {
    const res = await fetch(ENDPOINTS[tabName], {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Each endpoint returns data keyed by tab name (or a generic key —
    // affiliate-codes returns { codes }).
    return data[tabName] ?? data.codes ?? data.orders ?? data.customers ?? data.analytics ?? data.subscribers ?? data.inventory ?? data;
  } catch {
    return null;
  }
}

// ── Affiliates Tab ───────────────────────────────────────────────────────────

function AffiliatesTab({ affiliates, token, setAffiliates, loadTab }) {
  const codes = affiliates || [];
  const [label, setLabel]   = useState("");
  const [customCode, setCustomCode] = useState("");
  const [uses, setUses]     = useState(1);
  const [disc, setDisc]     = useState(10);
  const [generating, setGenerating] = useState(false);
  const [deactivating, setDeactivating] = useState(null);
  const [newCode, setNewCode] = useState(null);
  const [genError, setGenError] = useState(null);

  const postAffiliate = async (body) => {
    const res = await fetch("/api/admin/affiliate-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const generate = async () => {
    setGenerating(true);
    setNewCode(null);
    setGenError(null);
    const data = await postAffiliate({
      action: "generate",
      label: label.trim() || null,
      uses,
      discount_pct: disc,
      custom_code: customCode.trim() || undefined,
    });
    if (data.code) { setNewCode(data.code.code); setCustomCode(""); }
    else if (data.error) setGenError(data.error);
    const result = await loadTab("affiliates", token);
    if (result) setAffiliates(result);
    setGenerating(false);
  };

  const deactivate = async (id) => {
    setDeactivating(id);
    await postAffiliate({ action: "deactivate", code_id: id });
    const result = await loadTab("affiliates", token);
    if (result) setAffiliates(result);
    setDeactivating(null);
  };

  const active   = codes.filter((c) => c.is_active && c.uses_remaining > 0);
  const inactive = codes.filter((c) => !c.is_active || c.uses_remaining === 0);

  const inputStyle = {
    background: "transparent", border: "none", borderBottom: "1px solid rgba(212,175,55,0.3)",
    color: "#F0EFE8", padding: "6px 0", fontFamily: "'Cinzel',serif", fontSize: 16,
    outline: "none", width: "100%",
  };

  return (
    <div>
      {/* Generator */}
      <div style={{ background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.18)", padding: "28px", marginBottom: 28 }}>
        <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700, marginBottom: 22 }}>
          Generate New Code
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: 24, marginBottom: 22 }}>
          <div>
            <label className="section-label">Label (optional)</label>
            <input style={inputStyle} type="text" placeholder="e.g. Influencer A" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <label className="section-label">Custom code (optional)</label>
            <input style={inputStyle} type="text" placeholder="e.g. STRATOS10 — blank = random" value={customCode} onChange={(e) => setCustomCode(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className="section-label">Discount %</label>
            <input style={inputStyle} type="number" min="1" max="100" value={disc} onChange={(e) => setDisc(parseInt(e.target.value) || 10)} />
          </div>
          <div>
            <label className="section-label">Max Uses</label>
            <input style={inputStyle} type="number" min="1" value={uses} onChange={(e) => setUses(parseInt(e.target.value) || 1)} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="btn-gold" style={{ padding: "11px 28px", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, fontFamily: "'Montserrat',sans-serif", cursor: "pointer", border: "none" }} onClick={generate} disabled={generating}>
            {generating ? "Generating…" : "Generate Code"}
          </button>
          {newCode && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "monospace", fontSize: 18, color: "#D4AF37", letterSpacing: "0.12em" }}>{newCode}</span>
              <button onClick={() => navigator.clipboard?.writeText(newCode)} className="admin-btn" style={{ padding: "4px 10px" }}>Copy</button>
            </div>
          )}
          {genError && <span style={{ fontSize: 11, color: "#B04040" }}>{genError}</span>}
        </div>
      </div>

      {/* Active codes */}
      {active.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
            Active ({active.length})
          </div>
          {active.map((c) => (
            <div key={c.id} className="row-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "monospace", fontSize: 16, color: "#D4AF37", letterSpacing: "0.1em" }}>{c.code}</span>
                {c.label && <span style={{ fontSize: 11, color: "#5A5A52" }}>{c.label}</span>}
                <span style={{ fontSize: 10, color: "#70a870" }}>{c.discount_pct}% off</span>
                <span style={{ fontSize: 10, color: "#4A4A42" }}>{c.uses_remaining} / {c.uses_total} uses left</span>
                <span style={{ fontSize: 9, color: "#3A3A32" }}>{fmtDateShort(c.created_at)}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => navigator.clipboard?.writeText(c.code)} className="admin-btn" style={{ padding: "5px 12px" }}>Copy</button>
                <button onClick={() => deactivate(c.id)} className="admin-btn danger" disabled={deactivating === c.id} style={{ padding: "5px 12px" }}>
                  {deactivating === c.id ? "…" : "Deactivate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inactive codes */}
      {inactive.length > 0 && (
        <div>
          <div style={{ fontSize: 9, color: "#3A3A32", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
            Used / Inactive ({inactive.length})
          </div>
          {inactive.map((c) => (
            <div key={c.id} className="row-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", opacity: 0.45, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "monospace", fontSize: 15, color: "#5A5A52", letterSpacing: "0.1em", textDecoration: "line-through" }}>{c.code}</span>
                {c.label && <span style={{ fontSize: 11, color: "#3A3A32" }}>{c.label}</span>}
                <span style={{ fontSize: 10, color: "#3A3A32" }}>{c.discount_pct}% · {c.uses_remaining}/{c.uses_total} uses</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {codes.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", fontSize: 12, color: "#3A3A32" }}>No codes yet. Generate one above.</div>
      )}
    </div>
  );
}

export default function Admin() {
  // Session token survives refreshes for its 12h life (sessionStorage clears
  // when the tab closes, so it never outlives the browsing session).
  const [pw,          setPw]          = useState("");
  const [token,       setToken]       = useState(() => sessionStorage.getItem("ace_admin_token") || "");
  const [authed,      setAuthed]      = useState(() => !!sessionStorage.getItem("ace_admin_token"));
  const [tab,         setTab]         = useState("orders");
  const [loading,     setLoading]     = useState(false);
  const [updating,    setUpdating]    = useState(null);
  const [error,       setError]       = useState(null);

  const [orders,      setOrders]      = useState(null);
  const [customers,   setCustomers]   = useState(null);
  const [analytics,   setAnalytics]   = useState(null);
  const [subscribers, setSubscribers] = useState(null);
  const [waitlist,    setWaitlist]    = useState(null);
  const [inventory,   setInventory]   = useState(null);
  const [affiliates,  setAffiliates]  = useState(null);

  const DATA_MAP = { orders, customers, analytics, subscribers, waitlist, inventory, affiliates };
  const SET_MAP  = { orders: setOrders, customers: setCustomers, analytics: setAnalytics, subscribers: setSubscribers, waitlist: setWaitlist, inventory: setInventory, affiliates: setAffiliates };

  // loadTab: always returns the raw data, and stores it
  const loadTab = async (tabName, sessionToken) => {
    const result = await fetchTab(tabName, sessionToken);
    if (result !== null) SET_MAP[tabName](result);
    return result;
  };

  // Login: exchange the password for a short-lived session token, then load the
  // first tab with it. Admin endpoints only accept Bearer tokens, never the
  // raw password.
  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) {
        setLoading(false);
        setError(res.status === 429 ? "Too many attempts. Try again in 15 minutes." : "Incorrect password.");
        return;
      }
      setToken(data.token);
      try { sessionStorage.setItem("ace_admin_token", data.token); } catch {}
      const result = await loadTab("orders", data.token);
      setLoading(false);
      if (result === null) { setError("Session error. Please try again."); return; }
      setAuthed(true);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  };

  // Switch tabs (lazy load)
  const switchTab = async (newTab) => {
    setTab(newTab);
    if (DATA_MAP[newTab] !== null) return; // already cached
    setLoading(true);
    await loadTab(newTab, token);
    setLoading(false);
  };

  // Refresh current tab
  const refresh = async () => {
    setLoading(true);
    SET_MAP[tab](null); // clear cache so we re-fetch
    await loadTab(tab, token);
    setLoading(false);
  };

  // Sign out
  const signOut = () => {
    setAuthed(false);
    setPw("");
    setToken("");
    try { sessionStorage.removeItem("ace_admin_token"); } catch {}
    setOrders(null); setCustomers(null); setAnalytics(null); setSubscribers(null); setInventory(null);
    setTab("orders");
  };

  // Restore a saved session on refresh: load the first tab with the stored
  // token; if it has expired (401), drop back to the login screen.
  useEffect(() => {
    if (!authed || !token || orders !== null) return;
    (async () => {
      setLoading(true);
      const result = await loadTab("orders", token);
      setLoading(false);
      if (result === null) signOut();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ fontFamily: "'Montserrat',sans-serif", background: "#080808", color: "#F0EFE8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{FONTS + CSS}</style>
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
  const tabData = DATA_MAP[tab];

  return (
    <div style={{ fontFamily: "'Montserrat',sans-serif", background: "#080808", color: "#F0EFE8", minHeight: "100vh" }}>
      <style>{FONTS + CSS}</style>

      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(212,175,55,0.1)",
      }}>
        {/* Brand + controls */}
        <div style={{ padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: "0.18em", color: "#D4AF37" }}>
            ACE PEPTIDES <span style={{ fontSize: 8, color: "#3A3A32", letterSpacing: "0.26em" }}>ADMIN</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={refresh} disabled={loading} className="admin-btn">{loading ? "…" : "↻ Refresh"}</button>
            <button onClick={signOut} style={{ background: "none", border: "none", color: "#3A3A32", cursor: "pointer", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", fontFamily: "'Montserrat',sans-serif" }}>Sign Out</button>
          </div>
        </div>

        {/* Tab nav */}
        <div style={{ display: "flex", paddingLeft: 20, overflowX: "auto" }}>
          {TABS.map((t) => (
            <button
              key={t}
              className={`tab-nav-btn ${tab === t ? "active" : ""}`}
              onClick={() => switchTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 24px" }}>
        {loading && tabData === null ? (
          <div style={{ textAlign: "center", padding: "100px 0", color: "#3A3A32", fontSize: 12, letterSpacing: ".2em" }}>Loading…</div>
        ) : tabData === null ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#3A3A32", fontSize: 11 }}>No data.</div>
        ) : tab === "orders" ? (
          <OrdersTab
            orders={orders}
            token={token}
            updating={updating}
            setUpdating={setUpdating}
            setOrders={setOrders}
            loadTab={loadTab}
          />
        ) : tab === "customers" ? (
          <CustomersTab customers={customers} />
        ) : tab === "inventory" ? (
          <InventoryTab
            inventory={inventory}
            token={token}
            updating={updating}
            setUpdating={setUpdating}
            setInventory={setInventory}
            loadTab={loadTab}
          />
        ) : tab === "affiliates" ? (
          <AffiliatesTab
            affiliates={affiliates}
            token={token}
            setAffiliates={setAffiliates}
            loadTab={loadTab}
          />
        ) : tab === "subscribers" ? (
          <SubscribersTab subscribers={subscribers} />
        ) : tab === "waitlist" ? (
          <WaitlistTab waitlist={waitlist} />
        ) : tab === "analytics" ? (
          <AnalyticsTab analytics={analytics} />
        ) : null}
      </div>
    </div>
  );
}
