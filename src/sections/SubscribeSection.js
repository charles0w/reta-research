import { SUB_TIERS } from "../data";

export default function SubscribeSection({
  products,
  selectedTier, setSelectedTier,
  subProductId, setSubProductId,
  subQty, setSubQty,
  subStartDate, setSubStartDate,
  onStartSubscription,
}) {
  const subProduct = products.find((p) => p.id === subProductId) ?? products[1];
  const tierDiscount = SUB_TIERS.find((t) => t.key === selectedTier)?.discount ?? 0;
  const subOriginal = subProduct.price * subQty;
  const subTotal = subOriginal * (1 - tierDiscount);

  return (
    <div className="section-animate" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div className="eyebrow" style={{ textAlign: "center" }}>Membership</div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 400, letterSpacing: "0.05em", marginBottom: 18 }}>
          Subscribe &amp; Save
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.9, maxWidth: 560, margin: "0 auto" }}>
          Predictable supply for ongoing research. Lock in your cadence, lock in your price.
        </p>
      </div>

      {/* Tier grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, marginBottom: 48 }} className="tier-grid">
        {SUB_TIERS.map((t) => {
          const active = selectedTier === t.key;
          const perks = t.key === "monthly"
            ? ["Pause or cancel anytime", "Priority lot reservation", "Free shipping always"]
            : ["Pause or cancel anytime", "Priority lot reservation", "Free shipping over $200"];

          return (
            <div
              key={t.key}
              className={`tier-card ${active ? "active" : ""}`}
              onClick={() => setSelectedTier(t.key)}
            >
              <div style={{ position: "absolute", inset: 8, border: "1px solid rgba(212,175,55,0.07)", pointerEvents: "none" }} />

              {/* Popular badge */}
              {t.popular && (
                <span style={{
                  position: "absolute", top: 14, right: 14,
                  background: "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))",
                  color: "#000", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                  fontWeight: 700, padding: "4px 9px", fontFamily: "var(--font-sans)",
                }}>
                  ♠ Popular
                </span>
              )}

              {/* Corner pip */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1, zIndex: 1 }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--gold)", fontWeight: 600 }}>A</span>
                <span style={{ color: "var(--gold)", fontSize: 13, marginTop: 1 }}>♠</span>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", zIndex: 1, padding: "12px 0" }}>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, letterSpacing: "0.08em", color: "var(--text)" }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.05em", marginTop: 6, fontFamily: "var(--font-sans)" }}>{t.cadence}</div>
                <div className="gold-text" style={{ fontFamily: "var(--font-serif)", fontSize: 38, fontWeight: 600, margin: "18px 0 16px" }}>
                  {(t.discount * 100).toFixed(0)}% off
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 11, color: "var(--text-secondary)", lineHeight: 2.2, fontFamily: "var(--font-sans)" }}>
                  {perks.map((p) => (
                    <li key={p} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                      <span style={{ color: "var(--gold)", fontSize: 9 }}>◈</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className={active ? "btn-gold" : "btn-outline"}
                style={{ width: "100%", padding: "11px 14px", marginTop: 14, zIndex: 1 }}
                onClick={(e) => { e.stopPropagation(); setSelectedTier(t.key); }}
              >
                {active ? "✓ Selected" : "Select"}
              </button>

              {/* Bottom pip */}
              <div style={{ position: "absolute", bottom: 22, right: 22, display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.1, transform: "rotate(180deg)", zIndex: 1 }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--gold)", fontWeight: 600 }}>A</span>
                <span style={{ color: "var(--gold)", fontSize: 13, marginTop: 1 }}>♠</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configurator */}
      {selectedTier ? (
        <div style={{ border: "1px solid var(--border-hover)", padding: "32px 36px", background: "rgba(212,175,55,0.02)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 18, fontFamily: "var(--font-sans)" }}>
            Configure your subscription
          </div>

          {[
            {
              label: "Product",
              control: (
                <select className="sub-select" value={subProductId} onChange={(e) => setSubProductId(parseInt(e.target.value, 10))}>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — ${p.price.toFixed(2)}</option>
                  ))}
                </select>
              ),
            },
            {
              label: "Quantity per shipment",
              control: (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button type="button" className="qty-btn" onClick={() => setSubQty((q) => Math.max(1, q - 1))}>−</button>
                  <span style={{ fontSize: 14, color: "var(--text)", minWidth: 18, textAlign: "center", fontFamily: "var(--font-serif)" }}>{subQty}</span>
                  <button type="button" className="qty-btn" onClick={() => setSubQty((q) => q + 1)}>+</button>
                </div>
              ),
            },
            {
              label: "First shipment date",
              control: (
                <input
                  className="sub-date" type="date"
                  value={subStartDate}
                  onChange={(e) => setSubStartDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
              ),
            },
          ].map(({ label, control }, i, arr) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "20px 0",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              gap: 24,
            }} className="sub-row">
              <span style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-sans)", flexShrink: 0 }}>
                {label}
              </span>
              {control}
            </div>
          ))}

          {/* Summary */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 28, gap: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 10 }}>
                Per-shipment total
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span style={{ fontSize: 15, color: "var(--text-muted)", textDecoration: "line-through", fontFamily: "var(--font-serif)" }}>
                  ${subOriginal.toFixed(2)}
                </span>
                <span className="gold-text" style={{ fontFamily: "var(--font-serif)", fontSize: 28 }}>
                  ${subTotal.toFixed(2)}
                </span>
              </div>
            </div>
            <button className="btn-gold" style={{ padding: "16px 40px" }} onClick={onStartSubscription}>
              Start Subscription
            </button>
          </div>

          <div style={{ marginTop: 16, fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.04em", lineHeight: 1.7 }}>
            First shipment ships within 48 hours of confirmation. Future shipments auto-renew per cadence.
          </div>
        </div>
      ) : (
        <div style={{
          border: "1px dashed rgba(212,175,55,0.18)", padding: "56px 32px",
          textAlign: "center", fontSize: 11, color: "var(--text-muted)",
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          Select a tier above to configure your subscription
        </div>
      )}

      <div className="disclaimer">
        <strong>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only.
        Not for human or animal consumption. Not for use in diagnostic or therapeutic applications.
      </div>

      <style>{`
        @media (max-width: 720px) {
          .tier-grid { grid-template-columns: 1fr !important; }
          .tier-card { min-height: 280px !important; height: auto !important; }
          .sub-row { flex-direction: column !important; align-items: flex-start !important; }
          .sub-select, .sub-date { width: 100% !important; min-width: 0 !important; }
        }
      `}</style>
    </div>
  );
}
