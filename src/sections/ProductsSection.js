import { useState } from "react";
import AceLogo from "../components/AceLogo";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useState(() => {
    const m = window.matchMedia(query);
    const h = (e) => setMatches(e.matches);
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  });
  return matches;
}

function CardCornerPip({ flipped = false }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: flipped ? "flex-end" : "flex-start",
      lineHeight: 1.1,
      transform: flipped ? "rotate(180deg)" : "none",
      zIndex: 1,
    }}>
      <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--gold)", fontWeight: 600 }}>A</span>
      <span style={{ color: "var(--gold)", fontSize: 13, marginTop: 1 }}>♠</span>
    </div>
  );
}

function CardSpread({ products, onAdd }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const isMobile = useMediaQuery("(max-width: 720px)");

  const stack = [{ x: -22, y: 12, r: -11 }, { x: 2, y: 2, r: -2 }, { x: 24, y: 8, r: 9 }];
  const fan   = [{ x: -260, y: 50, r: -22 }, { x: 0, y: 0, r: 0 }, { x: 260, y: 50, r: 22 }];

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {products.map((p) => (
          <div key={p.id} style={{
            position: "relative",
            background: "linear-gradient(160deg, #0F0F0F 0%, #080808 100%)",
            border: "1.5px solid var(--border)",
            boxShadow: "0 6px 32px rgba(0,0,0,0.65)",
            padding: "22px 22px 18px",
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div style={{ position: "absolute", inset: 8, border: "1px solid rgba(212,175,55,0.07)", pointerEvents: "none" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <CardCornerPip />
              <AceLogo size={44} />
              <CardCornerPip flipped />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, letterSpacing: "0.05em", color: "var(--text)", marginBottom: 10 }}>{p.name}</div>
              <div className="gold-text" style={{ fontFamily: "var(--font-serif)", fontSize: 28 }}>${p.price.toFixed(2)}</div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 10, fontFamily: "var(--font-sans)" }}>
                {p.purity} purity · {p.form}
              </div>
            </div>
            <button className="btn-gold" style={{ marginTop: 4 }} onClick={() => onAdd(p)}>Add to Cart</button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{ position: "relative", height: 440, display: "flex", alignItems: "center", justifyContent: "center", cursor: open ? "default" : "pointer" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { setOpen(false); setActive(null); }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", width: 520, height: 320, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(212,175,55,0.055) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {products.map((p, i) => {
        const pos = open ? fan[i] : stack[i];
        const isActive = active === i && open;
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              width: 236,
              height: 328,
              transform: `translate(${pos.x}px, ${isActive ? pos.y - 36 : pos.y}px) rotate(${pos.r}deg) scale(${isActive ? 1.05 : 1})`,
              transition: "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.35s, border-color 0.35s",
              zIndex: isActive ? 10 : i + 1,
              background: "linear-gradient(160deg, #0F0F0F 0%, #080808 100%)",
              border: `1.5px solid ${isActive ? "rgba(212,175,55,0.65)" : "rgba(212,175,55,0.2)"}`,
              boxShadow: isActive
                ? "0 32px 80px rgba(0,0,0,0.9), 0 0 36px rgba(212,175,55,0.18)"
                : open ? "0 16px 48px rgba(0,0,0,0.75)" : "0 6px 28px rgba(0,0,0,0.65)",
              cursor: open ? "pointer" : "default",
              display: "flex", flexDirection: "column",
              padding: "18px 18px 20px",
              userSelect: "none", overflow: "hidden",
            }}
            onMouseEnter={() => open && setActive(i)}
            onMouseLeave={() => setActive(null)}
            onClick={() => open && onAdd(p)}
          >
            <div style={{ position: "absolute", inset: 8, border: "1px solid rgba(212,175,55,0.08)", pointerEvents: "none" }} />
            {isActive && (
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(212,175,55,0.035) 0%, transparent 50%)", pointerEvents: "none" }} />
            )}

            <CardCornerPip />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <AceLogo size={62} />
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, letterSpacing: "0.05em", color: "var(--text)", marginBottom: 12 }}>{p.name}</div>
                <div className="gold-text" style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 600 }}>${p.price.toFixed(2)}</div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 10, fontFamily: "var(--font-sans)" }}>
                  {p.purity} purity
                </div>
                <div style={{ fontSize: 9, color: "#2A2A20", letterSpacing: "0.10em", textTransform: "uppercase", marginTop: 4, fontFamily: "var(--font-sans)" }}>
                  {p.form}
                </div>
              </div>
              <div style={{
                marginTop: 10,
                background: isActive ? "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))" : "transparent",
                border: isActive ? "none" : "1px solid rgba(212,175,55,0.2)",
                color: isActive ? "#000" : "#484840",
                padding: "9px 24px",
                fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700,
                fontFamily: "var(--font-sans)",
                transition: "all 0.3s",
              }}>
                {isActive ? "Add to Cart" : "— view —"}
              </div>
            </div>

            <div style={{ alignSelf: "flex-end" }}>
              <CardCornerPip flipped />
            </div>
          </div>
        );
      })}

      <div style={{
        position: "absolute", bottom: -44,
        fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
        fontFamily: "var(--font-sans)", fontWeight: 600,
        color: open ? "rgba(212,175,55,0.45)" : "#1E1E18",
        transition: "color 0.4s", textAlign: "center", width: "100%", pointerEvents: "none",
      }}>
        {open ? "Hover a card · click to add" : "Hover to explore"}
      </div>
    </div>
  );
}

export default function ProductsSection({ products, onAdd }) {
  return (
    <div className="section-animate">

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 96 }}>
        <div className="logo-float" style={{ display: "inline-block", marginBottom: 32 }}>
          <AceLogo size={108} className="logo-glow" />
        </div>
        <div style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(42px, 7vw, 64px)",
          fontWeight: 400,
          letterSpacing: "0.24em",
          lineHeight: 1,
        }}>
          <span className="gold-text">ACE</span>
        </div>
        <div style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(10px, 1.5vw, 13px)",
          letterSpacing: "0.4em",
          color: "var(--text-muted)",
          marginTop: 8,
          marginBottom: 28,
        }}>
          PEPTIDES
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
          color: "var(--text-muted)", fontSize: 9, letterSpacing: "0.24em",
          textTransform: "uppercase", marginBottom: 24, fontFamily: "var(--font-sans)",
        }}>
          <span>Precision</span>
          <span style={{ color: "var(--gold)", fontSize: 11 }}>·</span>
          <span>Performance</span>
          <span style={{ color: "var(--gold)", fontSize: 11 }}>·</span>
          <span>Superiority</span>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.18), transparent)", maxWidth: 280, margin: "0 auto" }} />
      </div>

      {/* Products header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div className="eyebrow" style={{ textAlign: "center" }}>Research Compounds</div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 400, letterSpacing: "0.08em", marginBottom: 14 }}>
          Retatrutide
        </h2>
        <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.8, maxWidth: 440, margin: "0 auto", fontFamily: "var(--font-sans)" }}>
          HPLC-verified ≥99% purity · Lyophilized Powder · For in-vitro and laboratory research only
        </p>
      </div>

      {/* Card spread */}
      <CardSpread products={products} onAdd={onAdd} />

      <div style={{ height: 72 }} />

      {/* Spec strip */}
      <div style={{ display: "flex", gap: 2, marginBottom: 56 }} className="spec-strip">
        {products.map((p) => (
          <div key={p.id} className="spec-card">
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, letterSpacing: "0.04em", marginBottom: 12, color: "var(--text)" }}>{p.name}</div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontFamily: "var(--font-sans)" }}>CAS {p.cas}</div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14, fontFamily: "var(--font-sans)" }}>{p.form}</div>
            <div className="gold-text" style={{ fontFamily: "var(--font-serif)", fontSize: 20 }}>${p.price.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="disclaimer">
        <strong>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only.
        Not for human or animal consumption. Not for use in diagnostic or therapeutic applications.
      </div>

      <style>{`
        .spec-card {
          flex: 1;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 22px 24px;
          transition: border-color 0.3s;
        }
        .spec-card:hover { border-color: var(--border-hover); }
        @media (max-width: 720px) {
          .spec-strip { flex-direction: column !important; gap: 2px !important; }
        }
      `}</style>
    </div>
  );
}
