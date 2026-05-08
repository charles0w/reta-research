import { useState, useEffect, useRef } from "react";
import { SUB_TIERS, SQUARE_APP_ID, SQUARE_LOCATION_ID } from "../data";

function loadSquare() {
  return new Promise((resolve) => {
    if (window.Square) return resolve();
    const s = document.createElement("script");
    s.src = "https://web.squarecdn.com/v1/square.js";
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

const SHIP_FIELDS = [
  { key: "name",    label: "Full name",      type: "text",  half: false },
  { key: "email",   label: "Email",          type: "email", half: false },
  { key: "address", label: "Street address", type: "text",  half: false },
  { key: "city",    label: "City",           type: "text",  half: true  },
  { key: "state",   label: "State",          type: "text",  half: true  },
  { key: "zip",     label: "ZIP",            type: "text",  half: true  },
];

export default function SubscribeSection({ products }) {
  const [selectedTier,  setSelectedTier]  = useState(null);
  const [subProductId,  setSubProductId]  = useState(products[1]?.id ?? products[0]?.id);
  const [subQty,        setSubQty]        = useState(1);
  const [subStartDate,  setSubStartDate]  = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [shipping, setShipping] = useState({ name: "", email: "", address: "", city: "", state: "", zip: "" });

  const cardRef = useRef(null);
  const [cardInstance, setCardInstance] = useState(null);
  const [cardError,    setCardError]    = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [success,      setSuccess]      = useState(null);
  const [apiError,     setApiError]     = useState(null);

  const subProduct   = products.find((p) => p.id === subProductId) ?? products[0];
  const tier         = SUB_TIERS.find((t) => t.key === selectedTier);
  const pricePerUnit = subProduct ? +(subProduct.price * (1 - (tier?.discount ?? 0))).toFixed(2) : 0;
  const subTotal     = pricePerUnit * subQty;
  const subOriginal  = (subProduct?.price ?? 0) * subQty;

  const shippingReady = SHIP_FIELDS.every(({ key }) => shipping[key]?.trim());

  // Init Square card form when tier is selected
  useEffect(() => {
    if (!selectedTier || !SQUARE_APP_ID) return;
    let cardObj;
    let destroyed = false;

    (async () => {
      setCardError(null);
      try {
        await loadSquare();
        await new Promise((r) => setTimeout(r, 80));
        if (destroyed || !cardRef.current) return;
        const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        cardObj = await payments.card();
        await cardObj.attach(cardRef.current);
        setCardInstance(cardObj);
      } catch (err) {
        if (!destroyed) setCardError(err?.message || "Card form failed to load");
      }
    })();

    return () => {
      destroyed = true;
      cardObj?.destroy?.();
      setCardInstance(null);
    };
  }, [selectedTier]);

  const handleSubmit = async () => {
    if (!cardInstance || !shippingReady || !selectedTier) return;
    setSubmitting(true);
    setApiError(null);
    setCardError(null);
    try {
      const result = await cardInstance.tokenize();
      if (result.status !== "OK") throw new Error(result.errors?.[0]?.message || "Card declined");

      const r = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: result.token,
          productName: `${subProduct.name} — ${tier.name} Subscription`,
          pricePerUnit,
          qty: subQty,
          tier: tier.name,
          cadence: selectedTier,
          shippingInfo: shipping,
          startDate: subStartDate,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Subscription failed");

      setSuccess({ paymentId: data.paymentId, nextChargeDate: data.nextChargeDate });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="section-animate" style={{ maxWidth: 560, margin: "100px auto", textAlign: "center", padding: "0 24px" }}>
        <div style={{ fontSize: 36, color: "var(--gold)", marginBottom: 24, opacity: 0.7 }}>◈</div>
        <div className="eyebrow" style={{ textAlign: "center", marginBottom: 12 }}>Confirmed</div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, letterSpacing: "0.06em", marginBottom: 16 }}>
          Subscription Active
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.9, marginBottom: 12 }}>
          Your {tier?.name} subscription for {subProduct?.name} is confirmed.
          A receipt has been sent to <strong style={{ color: "var(--text)" }}>{shipping.email}</strong>.
        </p>
        <p style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
          Next shipment: {success.nextChargeDate}
        </p>
        <div style={{ marginTop: 10, fontSize: 9, color: "var(--text-muted)", fontFamily: "monospace" }}>
          Ref: {success.paymentId}
        </div>
        <button className="btn-outline" style={{ marginTop: 40, padding: "12px 32px" }} onClick={() => setSuccess(null)}>
          Start another
        </button>
      </div>
    );
  }

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

              <div style={{ position: "absolute", bottom: 22, right: 22, display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.1, transform: "rotate(180deg)", zIndex: 1 }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--gold)", fontWeight: 600 }}>A</span>
                <span style={{ color: "var(--gold)", fontSize: 13, marginTop: 1 }}>♠</span>
              </div>
            </div>
          );
        })}
      </div>

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
          ].map(({ label, control }) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "20px 0", borderBottom: "1px solid var(--border)", gap: 24,
            }} className="sub-row">
              <span style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-sans)", flexShrink: 0 }}>
                {label}
              </span>
              {control}
            </div>
          ))}

          {/* Per-shipment price */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "24px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-secondary)" }}>Per-shipment total</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ fontSize: 14, color: "var(--text-muted)", textDecoration: "line-through", fontFamily: "var(--font-serif)" }}>
                ${subOriginal.toFixed(2)}
              </span>
              <span className="gold-text" style={{ fontFamily: "var(--font-serif)", fontSize: 28 }}>
                ${subTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Shipping form */}
          <div style={{ marginTop: 28, marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16, color: "var(--gold)", fontFamily: "var(--font-sans)" }}>
              Shipping Details
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              {SHIP_FIELDS.map(({ key, label, type, half }) => (
                <input
                  key={key}
                  type={type}
                  placeholder={label}
                  value={shipping[key] || ""}
                  onChange={(e) => setShipping((s) => ({ ...s, [key]: e.target.value }))}
                  style={{
                    width: half ? "calc(50% - 7px)" : "100%",
                    background: "transparent", border: "none",
                    borderBottom: "1px solid rgba(212,175,55,0.22)",
                    color: "var(--text)", padding: "10px 0",
                    fontSize: 12, fontFamily: "var(--font-sans)",
                    outline: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderBottomColor = "rgba(212,175,55,0.65)")}
                  onBlur={(e)  => (e.target.style.borderBottomColor = "rgba(212,175,55,0.22)")}
                />
              ))}
            </div>
          </div>

          {/* Card form */}
          {shippingReady && SQUARE_APP_ID && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16, color: "var(--gold)", fontFamily: "var(--font-sans)" }}>
                Payment
              </div>
              <div ref={cardRef} style={{ marginBottom: 8 }} />
              {cardError && <div className="error-msg" style={{ marginTop: 8 }}>{cardError}</div>}
            </div>
          )}

          {!shippingReady && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textAlign: "center", padding: "16px 0", borderTop: "1px dashed rgba(212,175,55,0.12)" }}>
              Complete shipping details to enter payment
            </div>
          )}

          {apiError && <div className="error-msg" style={{ marginBottom: 16 }}>{apiError}</div>}

          {shippingReady && SQUARE_APP_ID && (
            <button
              className="btn-gold"
              style={{ width: "100%", padding: "16px 40px" }}
              onClick={handleSubmit}
              disabled={submitting || !cardInstance}
            >
              {submitting ? "Processing…" : `Start Subscription — $${subTotal.toFixed(2)}`}
            </button>
          )}

          <div style={{ marginTop: 16, fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.04em", lineHeight: 1.7 }}>
            First shipment ships within 48 hours of confirmation. Future shipments auto-renew per cadence.
            Your card is stored securely and charged automatically.
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
