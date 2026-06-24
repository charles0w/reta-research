import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

const RECIPIENT_ADDRESS = "0xDc074770cA4d806c03a172fE02231Dae37B6f25A";
const USDC_CONTRACT   = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC on Ethereum mainnet

// When true, checkout is disabled site-wide and replaced with a waitlist
// signup. api/send-order.js has the matching server-side guard (PAYMENTS_FROZEN).
// Flip REACT_APP_PAYMENTS_FROZEN in the environment and redeploy to toggle.
const PAYMENTS_FROZEN = process.env.REACT_APP_PAYMENTS_FROZEN === "true";
const coinbaseWallet = new CoinbaseWalletSDK({ appName: "Ace Peptides" });
const coinbaseProvider = coinbaseWallet.makeWeb3Provider();

const products = [
  { id: 1, name: "Retatrutide 5mg",  purity: "≥99.1%", form: "Lyophilized Powder", cas: "2381089-83-2", price: 50.00,  stock: true },
  { id: 2, name: "Retatrutide 10mg", purity: "≥99.1%", form: "Lyophilized Powder", cas: "2381089-83-2", price: 85.00,  stock: true, popular: true },
  { id: 3, name: "Retatrutide 15mg", purity: "≥99.1%", form: "Lyophilized Powder", cas: "2381089-83-2", price: 100.00, stock: "low" },
];

// Wholesale 10-vial packs at bulk pricing. Ids/prices must
// mirror api/_catalog.js (the server is the pricing authority on the order path).
const wholesalePacks = [
  { id: 101, baseId: 1, name: "Retatrutide 5mg — Wholesale 10-Pack",  vialName: "Retatrutide 5mg",  vials: 10, price: 400.00, singlePrice: 50.00  },
  { id: 102, baseId: 2, name: "Retatrutide 10mg — Wholesale 10-Pack", vialName: "Retatrutide 10mg", vials: 10, price: 730.00, singlePrice: 85.00  },
  { id: 103, baseId: 3, name: "Retatrutide 15mg — Wholesale 10-Pack", vialName: "Retatrutide 15mg", vials: 10, price: 850.00, singlePrice: 100.00 },
];

const researchFindings = [
  "Changes in body weight over the course of structured studies",
  "Modulation of appetite-related signaling",
  "Alterations in glucose and insulin-related markers",
  "Increased metabolic activity through multi-pathway receptor engagement",
];

const faqs = [
  { q: "What is Retatrutide (LY3437943)?", a: "Retatrutide is a synthetic peptide studied in metabolic and endocrine research. It functions as a triple receptor agonist, interacting with GLP-1, GIP, and glucagon receptors involved in energy balance and glucose regulation." },
  { q: "What observations have been reported in published findings?", a: "In controlled research settings, activation of these pathways has been associated with effects on appetite signaling, metabolic activity, and glucose-related markers." },
  { q: "Is this product for human consumption?", a: "No. This product is intended strictly for laboratory research purposes only. Not for human or animal consumption. Not for use in diagnostic or therapeutic applications." },
  { q: "Who can purchase?", a: "Products are available to qualified researchers, academic institutions, and licensed laboratories. By placing an order you confirm your purchase is solely for legitimate research purposes." },
];

// 45 particles — dense golden field
const PARTICLES = [
  { id: 0,  size: 1.5, left: 3,  delay: 0,    dur: 10 },
  { id: 1,  size: 1,   left: 8,  delay: 2,    dur: 12 },
  { id: 2,  size: 2,   left: 13, delay: 5,    dur: 9  },
  { id: 3,  size: 1.2, left: 18, delay: 1,    dur: 14 },
  { id: 4,  size: 2.5, left: 23, delay: 3,    dur: 11 },
  { id: 5,  size: 1,   left: 28, delay: 7,    dur: 13 },
  { id: 6,  size: 1.8, left: 33, delay: 0.5,  dur: 10 },
  { id: 7,  size: 3,   left: 38, delay: 4,    dur: 15 },
  { id: 8,  size: 1.5, left: 43, delay: 8,    dur: 11 },
  { id: 9,  size: 2,   left: 48, delay: 2.5,  dur: 12 },
  { id: 10, size: 1,   left: 53, delay: 6,    dur: 9  },
  { id: 11, size: 2.5, left: 58, delay: 1.5,  dur: 14 },
  { id: 12, size: 1.8, left: 63, delay: 9,    dur: 10 },
  { id: 13, size: 1,   left: 68, delay: 3.5,  dur: 13 },
  { id: 14, size: 2,   left: 73, delay: 0,    dur: 11 },
  { id: 15, size: 3,   left: 78, delay: 5,    dur: 15 },
  { id: 16, size: 1.5, left: 83, delay: 7.5,  dur: 12 },
  { id: 17, size: 1,   left: 88, delay: 2,    dur: 10 },
  { id: 18, size: 2,   left: 93, delay: 4.5,  dur: 14 },
  { id: 19, size: 1.5, left: 97, delay: 1,    dur: 11 },
  { id: 20, size: 3.5, left: 6,  delay: 6,    dur: 16 },
  { id: 21, size: 2.5, left: 15, delay: 3,    dur: 13 },
  { id: 22, size: 4,   left: 25, delay: 8,    dur: 18 },
  { id: 23, size: 2,   left: 35, delay: 1,    dur: 11 },
  { id: 24, size: 3,   left: 45, delay: 5,    dur: 15 },
  { id: 25, size: 2.5, left: 55, delay: 0,    dur: 12 },
  { id: 26, size: 3.5, left: 65, delay: 7,    dur: 16 },
  { id: 27, size: 2,   left: 75, delay: 3.5,  dur: 13 },
  { id: 28, size: 4,   left: 85, delay: 9,    dur: 18 },
  { id: 29, size: 3,   left: 95, delay: 2,    dur: 14 },
  { id: 30, size: 1,   left: 10, delay: 10,   dur: 9  },
  { id: 31, size: 2,   left: 20, delay: 11,   dur: 12 },
  { id: 32, size: 1.5, left: 30, delay: 12,   dur: 10 },
  { id: 33, size: 2.5, left: 40, delay: 9.5,  dur: 13 },
  { id: 34, size: 1,   left: 50, delay: 10.5, dur: 11 },
  { id: 35, size: 2,   left: 60, delay: 11.5, dur: 14 },
  { id: 36, size: 1.5, left: 70, delay: 8.5,  dur: 10 },
  { id: 37, size: 3,   left: 80, delay: 4,    dur: 15 },
  { id: 38, size: 1,   left: 90, delay: 6,    dur: 12 },
  { id: 39, size: 2,   left: 50, delay: 13,   dur: 11 },
  { id: 40, size: 1.5, left: 22, delay: 14,   dur: 13 },
  { id: 41, size: 2.5, left: 44, delay: 15,   dur: 16 },
  { id: 42, size: 1,   left: 66, delay: 12.5, dur: 9  },
  { id: 43, size: 3,   left: 77, delay: 11,   dur: 17 },
  { id: 44, size: 2,   left: 89, delay: 13.5, dur: 12 },
];

// matchMedia hook for layouts that can't be expressed in pure CSS — used
// to swap the playing-card fan for a stacked list on narrow viewports.
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const m = window.matchMedia(query);
    const h = (e) => setMatches(e.matches);
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, [query]);
  return matches;
}

// Canvas-based background removal: draws the image then zeros out near-black
// pixels, giving a truly transparent background regardless of CSS stacking contexts.
const AceLogo = ({ size = 80, className = "" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0);
      try {
        const id = ctx.getImageData(0, 0, w, h);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const brightness = (d[i] + d[i + 1] + d[i + 2]) / 3;
          if (brightness < 35) {
            d[i + 3] = 0; // fully transparent
          } else if (brightness < 80) {
            d[i + 3] = Math.round(((brightness - 35) / 45) * 255); // smooth edge
          }
        }
        ctx.putImageData(id, 0, 0);
      } catch (_) {}
    };
    img.src = "/ace-logo.png";
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: "auto", display: "block" }}
    />
  );
};

// Playing-card spread component
function CardSpread({ products, onAdd, stockMap }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const isMobile = useMediaQuery("(max-width: 720px)");

  const stack = [
    { x: -22, y: 12, r: -11 },
    { x:   2, y:  2, r:  -2 },
    { x:  24, y:  8, r:   9 },
  ];
  const fan = [
    { x: -256, y: 50, r: -22 },
    { x:    0, y:  0, r:   0 },
    { x:  256, y: 50, r:  22 },
  ];

  // Mobile: stacked vertical list — the desktop fan needs ~700px width.
  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              position: "relative",
              background: "linear-gradient(160deg, #0E0E0E 0%, #080808 100%)",
              border: "1.5px solid rgba(212,175,55,0.22)",
              boxShadow: "0 6px 28px rgba(0,0,0,0.65)",
              padding: 22, paddingTop: 18,
              display: "flex", flexDirection: "column", gap: 14,
            }}
          >
            <div style={{ position: "absolute", inset: 7, border: "1px solid rgba(212,175,55,0.09)", pointerEvents: "none" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#D4AF37", fontWeight: 600 }}>A</span>
                <span style={{ color: "#D4AF37", fontSize: 14, marginTop: 1 }}>♠</span>
              </div>
              <AceLogo size={48} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.1, transform: "rotate(180deg)" }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#D4AF37", fontWeight: 600 }}>A</span>
                <span style={{ color: "#D4AF37", fontSize: 14, marginTop: 1 }}>♠</span>
              </div>
            </div>

            <div style={{ textAlign: "center", zIndex: 1 }}>
              {p.popular && (
                <span style={{
                  display: "inline-block", marginBottom: 10,
                  background: "linear-gradient(135deg, #9A7A1A 0%, #D4AF37 50%, #F5D07A 100%)",
                  color: "#000", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                  fontWeight: 700, padding: "4px 8px", fontFamily: "'Montserrat', sans-serif",
                }}>
                  ♠ Most Popular
                </span>
              )}
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, letterSpacing: "0.05em", color: "#F0EFE8", marginBottom: 8 }}>
                {p.name}
              </div>
              <div className="gold-text" style={{ fontFamily: "'Cinzel', serif", fontSize: 26 }}>
                ${p.price.toFixed(2)}
              </div>
              <div style={{ fontSize: 9, color: "#4A4A42", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 8, fontFamily: "'Montserrat', sans-serif" }}>
                {p.purity} purity
              </div>
              <div style={{ fontSize: 9, color: "#3A3A32", letterSpacing: "0.10em", textTransform: "uppercase", marginTop: 3, fontFamily: "'Montserrat', sans-serif" }}>
                {p.form}
              </div>
              {stockMap[p.id] === "low" && (
                <div style={{ marginTop: 8, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#B87333", fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>
                  ⚠ Low Stock
                </div>
              )}
              {stockMap[p.id] === "out_of_stock" && (
                <div style={{ marginTop: 8, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#B04040", fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>
                  ✕ Out of Stock
                </div>
              )}
            </div>

            <button
              className="btn-gold"
              style={{ marginTop: 4, zIndex: 1, opacity: stockMap[p.id] === "out_of_stock" ? 0.4 : 1, cursor: stockMap[p.id] === "out_of_stock" ? "not-allowed" : "pointer" }}
              onClick={() => { if (stockMap[p.id] !== "out_of_stock") onAdd(p); }}
              disabled={stockMap[p.id] === "out_of_stock"}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{ position: "relative", height: 430, display: "flex", alignItems: "center", justifyContent: "center", cursor: open ? "default" : "pointer" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { setOpen(false); setActive(null); }}
    >
      {/* Vial photo backdrop — offset right of the fan, radially masked into the page black */}
      <img
        className="vial-backdrop"
        src="/vial-retatrutide-crop.jpg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          height: "132%",
          width: "auto",
          top: "50%",
          right: -150,
          transform: "translateY(-50%)",
          opacity: 0.85,
          pointerEvents: "none",
          userSelect: "none",
          WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,1) 45%, transparent 85%)",
          maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,1) 45%, transparent 85%)",
        }}
      />

      {/* Ambient glow behind cards */}
      <div style={{
        position: "absolute", width: 500, height: 300, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)",
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
              width: 228,
              height: 320,
              transform: `translate(${pos.x}px, ${isActive ? pos.y - 32 : pos.y}px) rotate(${pos.r}deg) scale(${isActive ? 1.06 : 1})`,
              transition: "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.35s, border-color 0.35s",
              zIndex: isActive ? 10 : i + 1,
              background: "linear-gradient(160deg, #0E0E0E 0%, #080808 100%)",
              border: `1.5px solid ${isActive ? "rgba(212,175,55,0.65)" : "rgba(212,175,55,0.22)"}`,
              boxShadow: isActive
                ? "0 28px 72px rgba(0,0,0,0.9), 0 0 32px rgba(212,175,55,0.2)"
                : open
                ? "0 14px 44px rgba(0,0,0,0.75)"
                : "0 6px 28px rgba(0,0,0,0.65)",
              cursor: open ? "pointer" : "default",
              display: "flex",
              flexDirection: "column",
              padding: 18,
              userSelect: "none",
              overflow: "hidden",
            }}
            onMouseEnter={() => open && setActive(i)}
            onMouseLeave={() => setActive(null)}
            onClick={() => open && stockMap[p.id] !== "out_of_stock" && onAdd(p)}
          >
            {/* Inner inset border */}
            <div style={{ position: "absolute", inset: 7, border: "1px solid rgba(212,175,55,0.09)", pointerEvents: "none" }} />

            {/* Subtle corner gradient on active */}
            {isActive && (
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(212,175,55,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />
            )}

            {/* Top-left corner pip */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1, zIndex: 1 }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#D4AF37", fontWeight: 600 }}>A</span>
              <span style={{ color: "#D4AF37", fontSize: 14, marginTop: 1 }}>♠</span>
            </div>

            {/* Most popular tag */}
            {p.popular && (
              <span style={{
                position: "absolute", top: 14, right: 14, zIndex: 1,
                background: "linear-gradient(135deg, #9A7A1A 0%, #D4AF37 50%, #F5D07A 100%)",
                color: "#000", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                fontWeight: 700, padding: "4px 8px", fontFamily: "'Montserrat', sans-serif",
              }}>
                ♠ Most Popular
              </span>
            )}

            {/* Center content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <AceLogo size={64} />
              <div style={{ textAlign: "center", marginTop: 6 }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: "0.05em", color: "#F0EFE8", marginBottom: 10 }}>
                  {p.name}
                </div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 26,
                  background: "linear-gradient(90deg, #9A7A1A, #F5D07A, #D4AF37, #F5D07A, #9A7A1A)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 5s linear infinite",
                }}>
                  ${p.price.toFixed(2)}
                </div>
                <div style={{ fontSize: 9, color: "#4A4A42", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 8, fontFamily: "'Montserrat', sans-serif" }}>
                  {p.purity} purity
                </div>
                <div style={{ fontSize: 9, color: "#3A3A32", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3, fontFamily: "'Montserrat', sans-serif" }}>
                  {p.form}
                </div>
                {stockMap[p.id] === "low" && (
                  <div style={{ marginTop: 8, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#B87333", fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>
                    ⚠ Low Stock
                  </div>
                )}
                {stockMap[p.id] === "out_of_stock" && (
                  <div style={{ marginTop: 8, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#B04040", fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>
                    ✕ Out of Stock
                  </div>
                )}
              </div>
              <div style={{
                marginTop: 8,
                background: isActive && stockMap[p.id] !== "out_of_stock" ? "linear-gradient(135deg, #9A7A1A, #D4AF37, #F5D07A)" : "transparent",
                border: isActive && stockMap[p.id] !== "out_of_stock" ? "none" : "1px solid rgba(212,175,55,0.25)",
                color: isActive && stockMap[p.id] !== "out_of_stock" ? "#000" : "#5A5A52",
                padding: "9px 22px",
                fontSize: 9,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                fontWeight: 700,
                fontFamily: "'Montserrat', sans-serif",
                transition: "background 0.3s, color 0.3s, border 0.3s",
                opacity: stockMap[p.id] === "out_of_stock" ? 0.45 : 1,
              }}>
                {stockMap[p.id] === "out_of_stock" ? "Out of Stock" : isActive ? "Add to Cart" : "— view —"}
              </div>
            </div>

            {/* Bottom-right corner pip — flex-start lands visually right after the 180° rotation */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1, transform: "rotate(180deg)", zIndex: 1 }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#D4AF37", fontWeight: 600 }}>A</span>
              <span style={{ color: "#D4AF37", fontSize: 14, marginTop: 1 }}>♠</span>
            </div>
          </div>
        );
      })}

      {/* Hover hint */}
      <div style={{
        position: "absolute", bottom: -40,
        fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
        fontFamily: "'Montserrat', sans-serif", fontWeight: 600,
        color: open ? "rgba(212,175,55,0.5)" : "#2A2A22",
        transition: "color 0.4s", textAlign: "center", width: "100%",
        pointerEvents: "none",
      }}>
        {open ? "Hover a card · click to add" : "Hover to explore"}
      </div>
    </div>
  );
}

const SUB_TIERS = [
  { key: "quarterly", name: "Quarterly", cadence: "Every 3 months",  discount: 0.05, popular: false },
  { key: "bimonthly", name: "Bi-monthly", cadence: "Every 2 months", discount: 0.10, popular: true  },
  { key: "monthly",   name: "Monthly",    cadence: "Every month",    discount: 0.15, popular: false },
];

// Shown in place of checkout while PAYMENTS_FROZEN is on. Self-contained:
// owns its own state and posts to /api/waitlist. `defaultProduct` pre-selects
// whatever is in the cart so a waiting visitor's interest is captured per-SKU.
function WaitlistPanel({ defaultProduct }) {
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState(defaultProduct || "");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), ...(product ? { product } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not join the waitlist. Please try again.");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error — please try again in a moment.");
    }
    setSubmitting(false);
  };

  return (
    <div style={{ marginBottom: 32, padding: "28px 28px 26px", border: "1px solid rgba(212,175,55,0.18)", background: "rgba(212,175,55,0.02)" }}>
      {done ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div className="gold-text" style={{ fontFamily: "'Cinzel', serif", fontSize: 32, marginBottom: 12 }}>◈</div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 400, letterSpacing: "0.06em", marginBottom: 10 }}>You're on the list</h3>
          <p style={{ fontSize: 12, color: "#5A5A52", lineHeight: 1.8, maxWidth: 380, margin: "0 auto" }}>
            We'll email <strong style={{ color: "#F0EFE8" }}>{email.trim()}</strong> the moment ordering reopens.
          </p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 12, color: "#D4AF37" }}>
            Ordering temporarily paused
          </div>
          <p style={{ fontSize: 12, color: "#5A5A52", marginBottom: 22, lineHeight: 1.75 }}>
            We're upgrading our checkout. Join the waitlist and we'll email you the moment ordering reopens — no payment now.
          </p>
          <div style={{ marginBottom: 18 }}>
            <label className="calc-label">Email</label>
            <input
              className="ship-input"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label className="calc-label">Product you're waiting for</label>
            <select
              className="ship-input"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="">Any / not sure yet</option>
              {products.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <button className="btn-gold" style={{ width: "100%", padding: 15 }} onClick={submit} disabled={submitting}>
            {submitting ? "Joining…" : "Join the waitlist"}
          </button>
          {error && <div className="error-msg">{error}</div>}
        </>
      )}
    </div>
  );
}

export default function App() {
  const [section, setSection] = useState("products");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  // Cart survives refreshes — an accidental reload mid-checkout shouldn't empty it.
  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ace_cart_v1") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try { localStorage.setItem("ace_cart_v1", JSON.stringify(cart)); } catch {}
  }, [cart]);

  // Recover stranded orders: if a past payment went through but the order save
  // failed, the payload was stashed in localStorage (see submitOrder). Retry on
  // load — the server is idempotent on txHash, so duplicates are impossible.
  useEffect(() => {
    (async () => {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("ace_pending_order_"));
      for (const key of keys) {
        try {
          const payload = JSON.parse(localStorage.getItem(key));
          const res = await fetch("/api/send-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.ok) localStorage.removeItem(key);
        } catch {
          /* still offline or server down — keep the stash for next visit */
        }
      }
    })();
  }, []);
  const [openFaq, setOpenFaq] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [walletError, setWalletError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const activeProvider = useRef(null);

  // Shipping form
  const [ship, setShip] = useState({ name: "", email: "", address: "", city: "", state: "", zip: "", country: "US" });
  const shipFilled = ["name", "email", "address", "city", "state", "zip"].every((k) => ship[k].trim() !== "");

  // Legal modal
  const [legalModal, setLegalModal] = useState(null); // null | "terms" | "privacy"

  // Checkout T&C
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showCheckoutTerms, setShowCheckoutTerms] = useState(false);

  // Post-payment success
  const [paid, setPaid] = useState(false);
  const [orderWarning, setOrderWarning] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null); // { orderId, paymentStatus }

  // Manual "pay from any wallet or exchange" flow: send to our address from
  // anywhere (Coinbase app, Kraken, mobile wallet), then paste the tx hash.
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCurrency, setManualCurrency] = useState("usdc"); // "usdc" | "eth"
  const [manualEthQuote, setManualEthQuote] = useState(null);   // { eth, at } or "loading"
  const [manualTxInput, setManualTxInput] = useState("");
  const [manualError, setManualError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);         // "address" | "amount"

  // Promo / affiliate code
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState(null);   // validated code string
  const [promoDiscount, setPromoDiscount] = useState(0); // e.g. 10 for 10%
  const [promoError, setPromoError] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setPromoError(data.error || "Invalid code"); }
      else { setPromoCode(promoInput.trim().toUpperCase()); setPromoDiscount(data.discount_pct); }
    } catch { setPromoError("Could not validate code. Try again."); }
    setPromoLoading(false);
  };

  const removePromo = () => { setPromoCode(null); setPromoDiscount(0); setPromoInput(""); setPromoError(null); };

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountedTotal = promoCode ? +(cartTotal * (1 - promoDiscount / 100)).toFixed(2) : cartTotal;

  // Subscribe
  const [selectedTier, setSelectedTier] = useState(null);
  const [subProductId, setSubProductId] = useState(products[1].id);
  const [subQty, setSubQty] = useState(1);
  const [subStartDate, setSubStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });

  const [stockMap, setStockMap] = useState({ 1: "in_stock", 2: "in_stock", 3: "low" });

  useEffect(() => {
    fetch("/api/stock")
      .then((r) => r.json())
      .then((data) => {
        const map = {};
        for (const s of (data.stock || [])) map[s.product_id] = s.stock_status;
        setStockMap(map);
      })
      .catch(() => {});
  }, []);

  const subProduct = products.find((p) => p.id === subProductId) ?? products[1];
  const tierDiscount = SUB_TIERS.find((t) => t.key === selectedTier)?.discount ?? 0;
  const subOriginal = subProduct.price * subQty;
  const subTotal = subOriginal * (1 - tierDiscount);

  const addToCart = (p) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) return prev.map((i) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, delta) =>
    setCart((prev) =>
      prev.flatMap((i) =>
        i.id !== id ? [i] : i.qty + delta < 1 ? [] : [{ ...i, qty: i.qty + delta }]
      )
    );

  const startSubscription = () => {
    if (!selectedTier) return;
    const tier = SUB_TIERS.find((t) => t.key === selectedTier);
    const subId = `sub-${selectedTier}-${subProduct.id}`;
    const discountedPrice = +(subProduct.price * (1 - tier.discount)).toFixed(2);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === subId);
      if (existing) return prev.map((i) => i.id === subId ? { ...i, qty: i.qty + subQty } : i);
      return [...prev, {
        ...subProduct,
        id: subId,
        productId: subProduct.id,
        name: `${subProduct.name} — ${tier.name} Subscription`,
        price: discountedPrice,
        qty: subQty,
        isSubscription: true,
      }];
    });
    setSection("cart");
  };


  const connectWallet = async (provider) => {
    setWalletError(null);
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      activeProvider.current = provider;
      setWalletAddress(accounts[0]);
    } catch {
      setWalletError("Wallet connection was rejected.");
    }
  };

  const connectMetaMask = () => {
    if (!window.ethereum) {
      setWalletError("MetaMask not detected. Please install the MetaMask extension.");
      return;
    }
    connectWallet(window.ethereum);
  };

  const connectCoinbase = () => connectWallet(coinbaseProvider);

  // Records the order after the on-chain payment has settled. The payment is
  // irreversible by this point, so a save failure must never be swallowed:
  // we persist the payload locally so it's recoverable and surface a notice.
  // Returns true only when the server confirms a saved order.
  const submitOrder = async (tx, method) => {
    const payload = { cart, shipping: ship, txHash: tx, total: discountedTotal, paymentMethod: method, ...(promoCode ? { promoCode } : {}) };
    try {
      const res = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok || !data.orderId) throw new Error(data.error || "Order not recorded");
      setOrderInfo({ orderId: data.orderId, paymentStatus: data.paymentStatus });
      return true;
    } catch (err) {
      try {
        localStorage.setItem(
          `ace_pending_order_${tx}`,
          JSON.stringify({ ...payload, error: String((err && err.message) || err) })
        );
      } catch {}
      console.error("Order save failed; payload stashed locally:", err);
      return false;
    }
  };

  const payWithWallet = async () => {
    const provider = activeProvider.current;
    if (!provider || !walletAddress) return;
    setPaymentLoading(true);
    setWalletError(null);
    setTxHash(null);
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
      const data = await res.json();
      const ethPrice  = data.ethereum.usd;
      const ethAmount = discountedTotal / ethPrice;
      const weiAmount = BigInt(Math.round(ethAmount * 1e14)) * 10000n;
      const hexValue  = "0x" + weiAmount.toString(16);
      const tx = await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: walletAddress, to: RECIPIENT_ADDRESS, value: hexValue }],
      });
      setTxHash(tx);
      const saved = await submitOrder(tx, "eth");
      setOrderWarning(!saved);
      setPaid(true);
      setCart([]);
    } catch (err) {
      setWalletError(err.message || "Transaction failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const payWithUSDC = async () => {
    const provider = activeProvider.current;
    if (!provider || !walletAddress) return;
    setPaymentLoading(true);
    setWalletError(null);
    setTxHash(null);
    try {
      // Require Ethereum mainnet — USDC contract is chain-specific
      const chainId = await provider.request({ method: "eth_chainId" });
      if (chainId !== "0x1") {
        setWalletError("USDC requires Ethereum mainnet. Please switch your wallet network to Ethereum and try again.");
        setPaymentLoading(false);
        return;
      }
      // Encode ERC-20 transfer(address,uint256) — USDC has 6 decimals
      const usdcAmount   = BigInt(Math.round(discountedTotal * 1e6));
      const recipientHex = RECIPIENT_ADDRESS.slice(2).toLowerCase().padStart(64, "0");
      const amountHex    = usdcAmount.toString(16).padStart(64, "0");
      const data = `0xa9059cbb${recipientHex}${amountHex}`;
      const tx = await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: walletAddress, to: USDC_CONTRACT, data, value: "0x0" }],
      });
      setTxHash(tx);
      const saved = await submitOrder(tx, "usdc");
      setOrderWarning(!saved);
      setPaid(true);
      setCart([]);
    } catch (err) {
      setWalletError(err.message || "Transaction failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // ETH quote for the manual flow. Padded 1% so normal price movement between
  // the quote and on-chain confirmation stays inside the server's 3% tolerance.
  const fetchManualEthQuote = async () => {
    setManualEthQuote("loading");
    setManualError(null);
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
      const data = await res.json();
      setManualEthQuote({ eth: (discountedTotal / data.ethereum.usd) * 1.01, at: Date.now() });
    } catch {
      setManualEthQuote(null);
      setManualError("Could not fetch the ETH price. Pay in USDC, or try again.");
    }
  };

  const selectManualCurrency = (c) => {
    setManualCurrency(c);
    setManualError(null);
    if (c === "eth") fetchManualEthQuote();
  };

  const copyToClipboard = async (field, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1600);
    } catch {}
  };

  // Unlike the wallet flow (where a save failure after an irreversible payment
  // must still show success), a manual confirm can safely surface server
  // rejections — resubmitting the same tx hash is idempotent on the server.
  const confirmManualPayment = async () => {
    const tx = manualTxInput.trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(tx)) {
      setManualError("That doesn't look like a transaction hash — it starts with 0x followed by 64 characters. Find it in your wallet or exchange's transaction history.");
      return;
    }
    setPaymentLoading(true);
    setManualError(null);
    try {
      const res = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, shipping: ship, txHash: tx, total: discountedTotal, paymentMethod: manualCurrency, ...(promoCode ? { promoCode } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setManualError(data.error || "Could not record the order. Double-check the transaction hash and try again.");
        setPaymentLoading(false);
        return;
      }
      setOrderInfo({ orderId: data.orderId, paymentStatus: data.paymentStatus });
      setTxHash(tx);
      setOrderWarning(false);
      setPaid(true);
      setCart([]);
    } catch {
      setManualError("Network error — your payment is safe. Press confirm again in a moment.");
    }
    setPaymentLoading(false);
  };

  if (process.env.REACT_APP_KILL_SWITCH === "true") {
    return (
      <div style={{ fontFamily: "'Montserrat', sans-serif", background: "#080808", color: "#F0EFE8", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Montserrat:wght@400;500&display=swap'); * { margin:0; padding:0; box-sizing:border-box; }`}</style>
        <AceLogo size={64} />
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 24, letterSpacing: "0.2em" }}>ACE PEPTIDES</span>
        <p style={{ fontSize: 11, color: "#4A4A42", letterSpacing: "0.15em", textTransform: "uppercase" }}>Temporarily Unavailable</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", background: "#080808", color: "#F0EFE8", minHeight: "100vh", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: #D4AF37; color: #000; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(212,175,55,0.4)); }
          50%       { filter: drop-shadow(0 0 20px rgba(212,175,55,0.9)); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes particleRise {
          0%   { transform: translateY(0) translateX(0);    opacity: 0; }
          6%   { opacity: 0.8; }
          88%  { opacity: 0.55; }
          100% { transform: translateY(-95vh) translateX(12px); opacity: 0; }
        }
        @keyframes shineSwipe {
          from { left: -80%; }
          to   { left: 160%; }
        }

        .logo-float   { animation: float 5s ease-in-out infinite; }
        .logo-glow    { animation: glowPulse 3.5s ease-in-out infinite; }
        .fade-section { animation: fadeInUp 0.65s ease both; }

        .gold-text {
          background: linear-gradient(90deg, #9A7A1A, #F5D07A, #D4AF37, #F5D07A, #9A7A1A);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }

        .nav-link {
          cursor: pointer; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
          color: #5A5A52; transition: color .3s; border: none; background: none;
          font-family: 'Montserrat', sans-serif; font-weight: 600;
          position: relative; padding-bottom: 6px;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 50%;
          width: 0; height: 1px; background: #D4AF37;
          transition: width .3s, left .3s;
        }
        .nav-link:hover, .nav-link.active { color: #D4AF37; }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; left: 0; }

        .btn-gold {
          background: linear-gradient(135deg, #9A7A1A 0%, #D4AF37 50%, #F5D07A 100%);
          color: #000; border: none; padding: 11px 26px;
          font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
          cursor: pointer; font-family: 'Montserrat', sans-serif; font-weight: 700;
          transition: opacity .2s, transform .2s;
          position: relative; overflow: hidden;
        }
        .btn-gold:hover { opacity: 0.88; transform: scale(1.03); }
        .btn-gold::after {
          content: ''; position: absolute; top: 0; left: -80%;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          transform: skewX(-18deg);
        }
        .btn-gold:hover::after { animation: shineSwipe 0.5s ease forwards; }

        .btn-outline-gold {
          background: transparent; border: 1px solid rgba(212,175,55,0.6); color: #D4AF37;
          padding: 11px 26px; font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
          cursor: pointer; font-family: 'Montserrat', sans-serif; font-weight: 600;
          transition: background .3s, color .3s, border-color .3s;
        }
        .btn-outline-gold:hover { background: #D4AF37; color: #000; border-color: #D4AF37; }

        .tag-gold {
          display: inline-block; font-size: 9px; letter-spacing: .14em; text-transform: uppercase;
          padding: 4px 10px; border: 1px solid rgba(212,175,55,0.35); color: #D4AF37; font-weight: 600;
        }

        .research-row {
          background: #0D0D0D; border: 1px solid rgba(212,175,55,0.08);
          padding: 22px 30px; display: flex; align-items: center; gap: 18px;
          transition: border-color .3s, transform .3s, background .3s;
        }
        .research-row:hover {
          border-color: rgba(212,175,55,0.28);
          transform: translateX(6px);
          background: rgba(212,175,55,0.025);
        }

        .faq-item { border-bottom: 1px solid rgba(212,175,55,0.1); }
        .faq-q {
          padding: 24px 0; cursor: pointer; display: flex;
          justify-content: space-between; align-items: center;
          font-size: 14px; font-weight: 500; letter-spacing: .02em;
          transition: color .2s;
        }
        .faq-q:hover { color: #D4AF37; }
        .faq-a { padding: 0 0 24px; font-size: 13px; color: #5A5A52; line-height: 1.85; }

        .cart-item-row { border-bottom: 1px solid rgba(212,175,55,0.1); }

        .wallet-box {
          border: 1px solid rgba(212,175,55,0.18); padding: 28px;
          background: rgba(212,175,55,0.02);
        }
        .wallet-address { font-size: 11px; color: #5A5A52; font-family: monospace; word-break: break-all; margin-top: 8px; }
        .tx-hash        { font-size: 10px; color: #5A5A52; font-family: monospace; word-break: break-all; margin-top: 8px; }
        .error-msg   { color: #B04040; font-size: 12px; margin-top: 12px; }
        .success-msg { color: #508050; font-size: 12px; margin-top: 12px; }

        .particle {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle, rgba(212,175,55,0.95), rgba(212,175,55,0.15), rgba(212,175,55,0));
          pointer-events: none; animation: particleRise linear infinite;
        }

        .divider-gold {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.22), transparent);
        }

        .section-eyebrow {
          font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
          color: #D4AF37; font-weight: 600; margin-bottom: 10px;
        }

        .spec-row {
          flex: 1; background: #0D0D0D; border: 1px solid rgba(212,175,55,0.07);
          padding: 20px 22px; transition: border-color .3s;
        }
        .spec-row:hover { border-color: rgba(212,175,55,0.2); }

        .calc-label {
          display: block; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #D4AF37; font-weight: 600; margin-bottom: 8px;
          font-family: 'Montserrat', sans-serif;
        }
        .calc-input {
          width: 100%; background: transparent; border: none;
          border-bottom: 1px solid rgba(212,175,55,0.22);
          color: #F0EFE8; padding: 10px 0;
          font-family: 'Cinzel', serif; font-size: 18px;
          outline: none; transition: border-color 0.3s;
          -moz-appearance: textfield;
        }
        .calc-input::-webkit-outer-spin-button,
        .calc-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .calc-input:focus { border-bottom-color: rgba(212,175,55,0.65); }
        .calc-input::placeholder { color: #2A2A22; }
        .ship-input {
          width: 100%; background: transparent; border: none;
          border-bottom: 1px solid rgba(212,175,55,0.22);
          color: #F0EFE8; padding: 10px 0;
          font-family: 'Montserrat', sans-serif; font-size: 14px;
          outline: none; transition: border-color 0.3s;
        }
        .ship-input:focus { border-bottom-color: rgba(212,175,55,0.65); }
        .ship-input::placeholder { color: #2A2A22; }

        .ship-addr-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 20px;
        }

        .modal-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(0,0,0,0.88); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .modal-box {
          background: #0D0D0D; border: 1px solid rgba(212,175,55,0.25);
          max-width: 580px; width: 100%; max-height: 82vh; overflow-y: auto;
          padding: 40px; position: relative;
        }
        .modal-close {
          position: absolute; top: 18px; right: 20px;
          background: none; border: none; color: #4A4A42; font-size: 22px;
          cursor: pointer; line-height: 1; padding: 4px;
          transition: color .2s;
        }
        .modal-close:hover { color: #D4AF37; }
        .modal-h { font-family: 'Cinzel', serif; font-size: 22px; font-weight: 400; letter-spacing: .06em; color: #F0EFE8; margin-bottom: 6px; }
        .modal-sub { font-size: 11px; color: #3A3A32; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 28px; }
        .modal-section { font-size: 10px; color: #D4AF37; letter-spacing: .18em; text-transform: uppercase; font-weight: 700; margin: 22px 0 8px; }
        .modal-p { font-size: 13px; color: #5A5A52; line-height: 1.85; margin-bottom: 0; }

        @media (max-width: 720px) {
          .ship-addr-grid { grid-template-columns: 1fr; }
          .modal-box { padding: 28px 22px; }
        }
        .calc-helper {
          font-size: 10px; color: #4A4A42; margin-top: 6px;
          line-height: 1.6; font-family: 'Montserrat', sans-serif;
        }

        .seg-group { display: flex; }
        .seg-btn {
          flex: 1; padding: 11px 14px; background: transparent;
          color: #5A5A52; border: 1px solid rgba(212,175,55,0.22);
          font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
          font-family: 'Montserrat', sans-serif; font-weight: 600;
          cursor: pointer; transition: background .3s, color .3s, border-color .3s;
        }
        .seg-btn + .seg-btn { border-left: none; }
        .seg-btn:hover { color: #D4AF37; }
        .seg-btn.active {
          background: linear-gradient(135deg, #9A7A1A 0%, #D4AF37 50%, #F5D07A 100%);
          color: #000; border-color: #D4AF37;
        }

        .result-panel {
          background: #0D0D0D; border: 1px solid rgba(212,175,55,0.18);
          padding: 32px; display: flex; gap: 0; margin-top: 48px;
        }
        .result-cell {
          flex: 1; padding: 0 24px; border-right: 1px solid rgba(212,175,55,0.10);
        }
        .result-cell:first-child { padding-left: 0; }
        .result-cell:last-child  { padding-right: 0; border-right: none; }

        .tier-card {
          position: relative; height: 360px; padding: 24px;
          background: linear-gradient(160deg, #0E0E0E 0%, #080808 100%);
          border: 1px solid rgba(212,175,55,0.22);
          cursor: pointer;
          transition: border-color .35s, box-shadow .35s, transform .35s;
          display: flex; flex-direction: column;
        }
        .tier-card:hover { border-color: rgba(212,175,55,0.45); }
        .tier-card.active {
          border-color: rgba(212,175,55,0.65);
          box-shadow: 0 14px 44px rgba(0,0,0,0.75), 0 0 32px rgba(212,175,55,0.18);
        }

        .sub-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 0; border-bottom: 1px solid rgba(212,175,55,0.10);
          gap: 20px;
        }

        .sub-select {
          background: transparent; border: none;
          border-bottom: 1px solid rgba(212,175,55,0.22);
          color: #F0EFE8; padding: 8px 0; min-width: 220px;
          font-family: 'Cinzel', serif; font-size: 14px;
          outline: none; cursor: pointer; transition: border-color .3s;
        }
        .sub-select:focus { border-bottom-color: rgba(212,175,55,0.65); }
        .sub-select option { background: #0D0D0D; color: #F0EFE8; font-family: 'Montserrat', sans-serif; }

        .sub-date {
          background: transparent; border: none;
          border-bottom: 1px solid rgba(212,175,55,0.22);
          color: #F0EFE8; padding: 8px 0;
          font-family: 'Cinzel', serif; font-size: 14px;
          outline: none; transition: border-color .3s;
          color-scheme: dark;
        }
        .sub-date:focus { border-bottom-color: rgba(212,175,55,0.65); }

        .qty-btn {
          border: 1px solid rgba(212,175,55,0.25); background: none;
          width: 26px; height: 26px; cursor: pointer; font-size: 14px;
          display: flex; align-items: center; justify-content: center; color: #D4AF37;
          transition: background .2s, color .2s;
        }
        .qty-btn:hover { background: rgba(212,175,55,0.08); }

        /* ─────────── Reduced motion ─────────── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            animation-delay: 0ms !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
          .particle { display: none !important; }
        }

        /* Vial backdrop bleeds past the main shell — clip so it can't cause a
           horizontal scrollbar; hide it when there's no room beside the fan. */
        html, body { overflow-x: clip; }
        @media (max-width: 1280px) {
          .vial-backdrop { display: none; }
        }

        /* ─────────── Tablet ≤ 900px ─────────── */
        @media (max-width: 900px) {
          .header-bar { padding: 14px 22px !important; }
          .header-nav { gap: 22px !important; }
          .main-shell { padding: 56px 22px 100px !important; }
          .footer-bar { padding: 22px 22px !important; }
        }

        /* ─────────── Mobile ≤ 720px ─────────── */
        @media (max-width: 720px) {
          .header-bar {
            padding: 12px 16px !important;
            flex-wrap: wrap; gap: 10px;
          }
          .header-nav {
            gap: 14px !important;
            order: 3; width: 100%;
            justify-content: flex-start; flex-wrap: wrap;
            padding-top: 6px; row-gap: 10px;
            /* Room for the absolutely-positioned cart badge (right: -16px) so it
               isn't clipped by overflow-x clip when Cart lands at the edge. */
            padding-right: 20px;
          }
          .nav-link { font-size: 9px !important; letter-spacing: 0.16em !important; padding-bottom: 4px !important; }
          .main-shell { padding: 40px 18px 80px !important; }
          .hero-block { margin-bottom: 64px !important; }
          .hero-wordmark { font-size: 38px !important; letter-spacing: 0.18em !important; }
          .hero-sub { font-size: 11px !important; letter-spacing: 0.30em !important; }
          .hero-tagline { gap: 10px !important; font-size: 8px !important; }
          .section-h2 { font-size: 26px !important; margin-bottom: 32px !important; }
          .section-h2-tight { font-size: 24px !important; }
          .section-h2-sub { font-size: 22px !important; }
          .lead-copy { font-size: 13px !important; line-height: 1.8 !important; }

          .responsive-grid-2 { grid-template-columns: 1fr !important; gap: 22px !important; }
          .responsive-grid-3 { grid-template-columns: 1fr !important; gap: 8px !important; }

          .responsive-result-panel {
            flex-direction: column !important; padding: 22px !important; gap: 0;
          }
          .responsive-result-panel .result-cell {
            padding: 18px 0 !important; border-right: none !important;
            border-bottom: 1px solid rgba(212,175,55,0.10);
          }
          .responsive-result-panel .result-cell:first-child { padding-top: 0 !important; }
          .responsive-result-panel .result-cell:last-child {
            padding-bottom: 0 !important; border-bottom: none;
          }

          .seg-group { flex-wrap: wrap; }
          .seg-btn {
            padding: 9px 8px !important; font-size: 9px !important;
            letter-spacing: 0.10em !important; flex: 1 0 33%;
          }

          .spec-strip { flex-direction: column !important; gap: 6px !important; }
          .spec-row { padding: 16px 18px !important; }

          .tier-card { height: auto !important; min-height: 280px; padding: 22px !important; }

          .sub-row {
            flex-direction: column !important; align-items: flex-start !important;
            gap: 10px; padding: 16px 0 !important;
          }
          .sub-row > *:last-child { width: 100%; }
          .sub-select, .sub-date { min-width: 0 !important; width: 100%; }

          .config-summary {
            flex-direction: column !important;
            align-items: stretch !important; gap: 22px !important;
          }
          .config-summary .btn-gold { width: 100%; }

          .cart-row {
            flex-direction: column !important; align-items: flex-start !important;
            gap: 14px;
          }
          .cart-row > *:last-child { align-self: flex-end; }

          .footer-bar {
            padding: 20px 18px !important;
            flex-direction: column !important; gap: 8px; text-align: center;
          }

          .empty-cart { padding: 56px 12px !important; }
        }
      `}</style>

      {/* Dense particle field */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              width: p.size, height: p.size,
              left: `${p.left}%`, bottom: "-8px",
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="header-bar" style={{
        padding: "18px 56px", display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8,8,8,0.94)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(212,175,55,0.1)",
      }}>
        <div
          className="logo-float"
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
          onClick={() => setSection("products")}
        >
          <AceLogo size={34} className="logo-glow" />
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, letterSpacing: "0.2em", color: "#F0EFE8" }}>ACE</div>
            <div style={{ fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "#4A4A42", marginTop: 3 }}>PEPTIDES</div>
          </div>
        </div>

        <nav className="header-nav" style={{ display: "flex", gap: 36, alignItems: "center" }}>
          {[["products", "Products"], ["research", "Research"], ["faq", "FAQ"], ["subscribe", "Subscribe"], ["support", "Support"]].map(([key, label]) => (
            <button key={key} className={`nav-link ${section === key ? "active" : ""}`} onClick={() => setSection(key)}>
              {label}
            </button>
          ))}
          <button className="nav-link" style={{ position: "relative" }} onClick={() => setSection("cart")}>
            Cart
            {totalItems > 0 && (
              <span style={{
                position: "absolute", top: -8, right: -16,
                background: "#D4AF37", color: "#000", borderRadius: "50%",
                width: 17, height: 17, fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Montserrat', sans-serif",
              }}>
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </header>

      {PAYMENTS_FROZEN && !bannerDismissed && (
        <div style={{ background: "rgba(212,175,55,0.08)", borderBottom: "1px solid rgba(212,175,55,0.2)", padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, letterSpacing: "0.06em", color: "#D4AF37", textAlign: "center" }}>
            Ordering is temporarily paused — join the waitlist to be notified the moment it reopens.
          </span>
          <button
            onClick={() => setSection("cart")}
            style={{ background: "none", border: "1px solid rgba(212,175,55,0.5)", color: "#D4AF37", padding: "4px 14px", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
          >
            Join waitlist
          </button>
          <button onClick={() => setBannerDismissed(true)} aria-label="Dismiss" style={{ background: "none", border: "none", color: "#6A6A60", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
      )}

      <div className="divider-gold" />

      <main className="main-shell" style={{ maxWidth: 1060, margin: "0 auto", padding: "72px 32px 140px", position: "relative", zIndex: 1 }}>

        {/* ── Products ── */}
        {section === "products" && (
          <div className="fade-section">

            {/* Hero */}
            <div className="hero-block" style={{ textAlign: "center", marginBottom: 96 }}>
              <div className="logo-float" style={{ display: "inline-block", marginBottom: 28 }}>
                <AceLogo size={110} className="logo-glow" />
              </div>
              <div className="hero-wordmark" style={{ fontFamily: "'Cinzel', serif", fontSize: 54, fontWeight: 400, letterSpacing: "0.22em", lineHeight: 1 }}>
                <span className="gold-text">ACE</span>
              </div>
              <div className="hero-sub" style={{ fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: "0.36em", color: "#3A3A32", marginTop: 6, marginBottom: 22 }}>
                PEPTIDES
              </div>
              <div className="hero-tagline" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, color: "#3A3A32", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 18 }}>
                <span>Precision</span>
                <span style={{ color: "#D4AF37", fontSize: 12 }}>·</span>
                <span>Performance</span>
                <span style={{ color: "#D4AF37", fontSize: 12 }}>·</span>
                <span>Superiority</span>
              </div>
              <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.18), transparent)", maxWidth: 320, margin: "0 auto" }} />
            </div>

            {/* Section header */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div className="section-eyebrow" style={{ justifyContent: "center", display: "flex" }}>Research Compounds</div>
              <h2 className="section-h2-sub" style={{ fontFamily: "'Cinzel', serif", fontSize: 26, fontWeight: 400, letterSpacing: "0.08em", marginBottom: 10 }}>
                Retatrutide
              </h2>
              <p style={{ fontSize: 12, color: "#4A4A42", lineHeight: 1.75, maxWidth: 440, margin: "0 auto" }}>
                HPLC-verified ≥99% purity · Lyophilized Powder · For in-vitro and laboratory research only
              </p>
            </div>

            {/* Card spread — main product interaction */}
            <CardSpread products={products} onAdd={addToCart} stockMap={stockMap} />

            {/* Spacer for hint text */}
            <div style={{ height: 68 }} />

            {/* Quick-spec strip */}
            <div className="spec-strip" style={{ display: "flex", gap: 2, marginBottom: 56 }}>
              {products.map((p) => (
                <div key={p.id} className="spec-row">
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, letterSpacing: "0.04em", marginBottom: 10, color: "#F0EFE8" }}>{p.name}</div>
                  <div style={{ fontSize: 9, color: "#4A4A42", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>CAS {p.cas}</div>
                  <div style={{ fontSize: 9, color: "#4A4A42", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{p.form}</div>
                  <div style={{
                    fontSize: 18, fontFamily: "'Cinzel', serif",
                    background: "linear-gradient(90deg, #9A7A1A, #F5D07A, #D4AF37, #F5D07A, #9A7A1A)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text", animation: "shimmer 5s linear infinite",
                  }}>
                    ${p.price.toFixed(2)}
                  </div>
                  {stockMap[p.id] === "low" && (
                    <div style={{ marginTop: 8, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#B87333", fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>
                      ⚠ Low Stock
                    </div>
                  )}
                  {stockMap[p.id] === "out_of_stock" && (
                    <div style={{ marginTop: 8, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#B04040", fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>
                      ✕ Out of Stock
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Wholesale packs */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div className="section-eyebrow" style={{ justifyContent: "center", display: "flex" }}>Wholesale</div>
              <h2 className="section-h2-sub" style={{ fontFamily: "'Cinzel', serif", fontSize: 26, fontWeight: 400, letterSpacing: "0.08em", marginBottom: 10 }}>
                Bulk Research Packs
              </h2>
              <p style={{ fontSize: 12, color: "#4A4A42", lineHeight: 1.75, maxWidth: 440, margin: "0 auto" }}>
                10 vials per pack · save up to 20% vs single vials · For high-volume laboratory programs
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 56 }}>
              {wholesalePacks.map((w) => {
                const out = stockMap[w.baseId] === "out_of_stock";
                const savings = w.singlePrice * w.vials - w.price;
                return (
                  <div key={w.id} className="row-card sub-row" style={{ border: "1px solid rgba(212,175,55,0.12)", background: "#0D0D0D", padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                    <div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, letterSpacing: "0.04em", color: "#F0EFE8", marginBottom: 6 }}>
                        {w.vialName} <span style={{ color: "#D4AF37" }}>× {w.vials}</span>
                      </div>
                      <div style={{ fontSize: 9, color: "#4A4A42", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        ${(w.price / w.vials).toFixed(2)} per vial · save ${savings.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 11, color: "#3A3A32", textDecoration: "line-through", marginRight: 10 }}>
                          ${(w.singlePrice * w.vials).toFixed(2)}
                        </span>
                        <span className="gold-text" style={{ fontFamily: "'Cinzel', serif", fontSize: 20 }}>
                          ${w.price.toFixed(2)}
                        </span>
                      </div>
                      <button
                        className="btn-gold"
                        style={{ padding: "11px 24px", opacity: out ? 0.4 : 1, cursor: out ? "not-allowed" : "pointer" }}
                        disabled={out}
                        onClick={() => addToCart({ id: w.id, name: w.name, price: w.price })}
                      >
                        {out ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "18px 28px", border: "1px solid rgba(212,175,55,0.07)", fontSize: 11, color: "#3A3A32", lineHeight: 1.8, textAlign: "center", letterSpacing: "0.02em" }}>
              <strong style={{ color: "#5A5A52" }}>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only. Not for human or animal consumption. Not for use in diagnostic or therapeutic applications.
            </div>
          </div>
        )}

        {/* ── Research ── */}
        {section === "research" && (
          <div className="fade-section">
            <div className="section-eyebrow">Science</div>
            <h2 className="section-h2" style={{ fontFamily: "'Cinzel', serif", fontSize: 34, fontWeight: 400, letterSpacing: "0.05em", marginBottom: 28 }}>Retatrutide Overview</h2>
            <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", marginBottom: 64 }}>
              <div>
                <p className="lead-copy" style={{ fontSize: 13, color: "#5A5A52", marginBottom: 18, lineHeight: 1.88, maxWidth: 580 }}>
                  Retatrutide (LY3437943) is a synthetic peptide studied in metabolic and endocrine research. It functions as a triple receptor agonist, interacting with GLP-1, GIP, and glucagon receptors involved in energy balance and glucose regulation.
                </p>
                <p className="lead-copy" style={{ fontSize: 13, color: "#5A5A52", marginBottom: 0, lineHeight: 1.88, maxWidth: 580 }}>
                  In controlled research settings, activation of these pathways has been associated with effects on appetite signaling, metabolic activity, and glucose-related markers. Retatrutide continues to be studied for its role in metabolic research.
                </p>
              </div>
              <div style={{
                position: "relative",
                border: "1.5px solid rgba(212,175,55,0.22)",
                boxShadow: "0 14px 44px rgba(0,0,0,0.75)",
                padding: 7,
                maxWidth: 380,
                justifySelf: "center",
              }}>
                <div style={{ position: "absolute", inset: 7, border: "1px solid rgba(212,175,55,0.09)", pointerEvents: "none", zIndex: 1 }} />
                <img
                  src="/vial-retatrutide.jpg"
                  alt="Ace Peptides Retatrutide 10mg research vial"
                  style={{ display: "block", width: "100%", height: "auto" }}
                />
              </div>
            </div>
            <div className="section-eyebrow">Published Findings</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {researchFindings.map((finding, i) => (
                <div key={i} className="research-row">
                  <span style={{ color: "#D4AF37", fontSize: 14, flexShrink: 0 }}>◈</span>
                  <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.01em" }}>{finding}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 56, padding: "18px 28px", border: "1px solid rgba(212,175,55,0.07)", fontSize: 11, color: "#3A3A32", lineHeight: 1.8, textAlign: "center" }}>
              <strong style={{ color: "#5A5A52" }}>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only. Not for human or animal consumption. Not for use in diagnostic or therapeutic applications.
            </div>
          </div>
        )}

        {/* ── FAQ ── */}
        {section === "faq" && (
          <div className="fade-section">
            <div className="section-eyebrow">Support</div>
            <h2 className="section-h2" style={{ fontFamily: "'Cinzel', serif", fontSize: 34, fontWeight: 400, letterSpacing: "0.05em", marginBottom: 52 }}>Frequently Asked</h2>
            <div>
              {faqs.map((f, i) => (
                <div key={i} className="faq-item">
                  <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{f.q}</span>
                    <span style={{ fontSize: 20, color: "#D4AF37", display: "inline-block", marginLeft: 20, flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform .25s" }}>+</span>
                  </div>
                  {openFaq === i && <div className="faq-a">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Support ── */}
        {section === "support" && (
          <div className="fade-section" style={{ maxWidth: 720, margin: "0 auto" }}>
            <div className="section-eyebrow">Assistance</div>
            <h2 className="section-h2" style={{ fontFamily: "'Cinzel', serif", fontSize: 34, fontWeight: 400, letterSpacing: "0.05em", marginBottom: 18 }}>Support</h2>
            <p className="lead-copy" style={{ fontSize: 13, color: "#5A5A52", lineHeight: 1.88, maxWidth: 560, marginBottom: 56 }}>
              Questions about an order, shipping, or our research compounds? Reach us through either channel below — we typically respond within one business day.
            </p>

            <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <a
                href="mailto:support@ace-peptides.com"
                style={{ textDecoration: "none", color: "inherit", background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.14)", padding: "34px 30px", display: "block", transition: "border-color .25s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.45)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.14)")}
              >
                <div style={{ fontSize: 22, marginBottom: 14 }}>✉</div>
                <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Email</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 17, letterSpacing: "0.03em", color: "#F0EFE8", marginBottom: 8, wordBreak: "break-all" }}>
                  support@ace-peptides.com
                </div>
                <div style={{ fontSize: 11, color: "#4A4A42", lineHeight: 1.7 }}>
                  Best for order issues, tracking, and detailed questions.
                </div>
              </a>

              <a
                href="tel:+17866716256"
                style={{ textDecoration: "none", color: "inherit", background: "#0D0D0D", border: "1px solid rgba(212,175,55,0.14)", padding: "34px 30px", display: "block", transition: "border-color .25s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.45)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.14)")}
              >
                <div style={{ fontSize: 22, marginBottom: 14 }}>✆</div>
                <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Phone</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 17, letterSpacing: "0.03em", color: "#F0EFE8", marginBottom: 8 }}>
                  (786) 671-6256
                </div>
                <div style={{ fontSize: 11, color: "#4A4A42", lineHeight: 1.7 }}>
                  Call or text for quick questions about your order.
                </div>
              </a>
            </div>

            <div style={{ marginTop: 56, padding: "18px 28px", border: "1px solid rgba(212,175,55,0.07)", fontSize: 11, color: "#3A3A32", lineHeight: 1.8, textAlign: "center" }}>
              <strong style={{ color: "#5A5A52" }}>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only. Not for human or animal consumption. Not for use in diagnostic or therapeutic applications.
            </div>
          </div>
        )}

        {/* ── Subscribe ── */}
        {section === "subscribe" && (
          <div className="fade-section" style={{ maxWidth: 880, margin: "0 auto" }}>
            <div className="section-eyebrow">Membership</div>
            <h2 className="section-h2" style={{ fontFamily: "'Cinzel', serif", fontSize: 34, fontWeight: 400, letterSpacing: "0.05em", marginBottom: 18 }}>
              Subscribe &amp; Save
            </h2>
            <p className="lead-copy" style={{ fontSize: 13, color: "#5A5A52", lineHeight: 1.88, maxWidth: 600, margin: "0 auto 56px", textAlign: "center" }}>
              Predictable supply for ongoing research. Lock in your cadence, lock in your price.
            </p>

            {/* Tier grid */}
            <div className="responsive-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, marginBottom: 64 }}>
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
                    {/* inner inset */}
                    <div style={{ position: "absolute", inset: 7, border: "1px solid rgba(212,175,55,0.09)", pointerEvents: "none" }} />

                    {/* top-left pip */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1, zIndex: 1 }}>
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#D4AF37", fontWeight: 600 }}>A</span>
                      <span style={{ color: "#D4AF37", fontSize: 14, marginTop: 1 }}>♠</span>
                    </div>

                    {/* Most popular tag */}
                    {t.popular && (
                      <span style={{
                        position: "absolute", top: 16, right: 16,
                        background: "linear-gradient(135deg, #9A7A1A 0%, #D4AF37 50%, #F5D07A 100%)",
                        color: "#000", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                        fontWeight: 700, padding: "4px 8px", fontFamily: "'Montserrat', sans-serif",
                      }}>
                        ♠ Most Popular
                      </span>
                    )}

                    {/* Center content */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", zIndex: 1 }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, letterSpacing: "0.08em", color: "#F0EFE8" }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#4A4A42", letterSpacing: "0.06em", marginTop: 6, fontFamily: "'Montserrat', sans-serif" }}>
                        {t.cadence}
                      </div>
                      <div className="gold-text" style={{ fontFamily: "'Cinzel', serif", fontSize: 36, fontWeight: 600, margin: "18px 0 16px" }}>
                        {(t.discount * 100).toFixed(0)}% off
                      </div>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 11, color: "#5A5A52", lineHeight: 2, fontFamily: "'Montserrat', sans-serif" }}>
                        {perks.map((p) => <li key={p}>{p}</li>)}
                      </ul>
                    </div>

                    {/* Select button */}
                    <button
                      type="button"
                      className={active ? "btn-gold" : "btn-outline-gold"}
                      style={{ width: "100%", padding: "10px 14px", marginTop: 16, zIndex: 1 }}
                      onClick={(e) => { e.stopPropagation(); setSelectedTier(t.key); }}
                    >
                      {active ? "Selected" : "Select"}
                    </button>

                    {/* bottom-right pip */}
                    <div style={{ position: "absolute", bottom: 24, right: 24, display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.1, transform: "rotate(180deg)", zIndex: 1 }}>
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#D4AF37", fontWeight: 600 }}>A</span>
                      <span style={{ color: "#D4AF37", fontSize: 14, marginTop: 1 }}>♠</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Configurator */}
            {selectedTier ? (
              <div style={{ border: "1px solid rgba(212,175,55,0.18)", padding: 32, background: "rgba(212,175,55,0.02)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 10 }}>
                  Configure your subscription
                </div>

                <div className="sub-row">
                  <span style={{ fontSize: 11, color: "#6A6A60", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
                    Product
                  </span>
                  <select
                    className="sub-select"
                    value={subProductId}
                    onChange={(e) => setSubProductId(parseInt(e.target.value, 10))}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — ${p.price.toFixed(2)}</option>
                    ))}
                  </select>
                </div>

                <div className="sub-row">
                  <span style={{ fontSize: 11, color: "#6A6A60", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
                    Quantity per shipment
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button type="button" className="qty-btn" onClick={() => setSubQty((q) => Math.max(1, q - 1))}>−</button>
                    <span style={{ fontSize: 13, color: "#F0EFE8", minWidth: 16, textAlign: "center", fontFamily: "'Cinzel', serif" }}>
                      {subQty}
                    </span>
                    <button type="button" className="qty-btn" onClick={() => setSubQty((q) => q + 1)}>+</button>
                  </div>
                </div>

                <div className="sub-row" style={{ borderBottom: "none" }}>
                  <span style={{ fontSize: 11, color: "#6A6A60", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
                    First shipment date
                  </span>
                  <input
                    className="sub-date" type="date"
                    value={subStartDate}
                    onChange={(e) => setSubStartDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>

                {/* Summary */}
                <div className="config-summary" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 28 }}>
                  <div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6A6A60" }}>
                      Per-shipment total
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
                      <span style={{ fontSize: 14, color: "#4A4A42", textDecoration: "line-through", fontFamily: "'Cinzel', serif" }}>
                        ${subOriginal.toFixed(2)}
                      </span>
                      <span className="gold-text" style={{ fontFamily: "'Cinzel', serif", fontSize: 24 }}>
                        ${subTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button className="btn-gold" style={{ padding: "16px 36px" }} onClick={startSubscription}>
                    Start Subscription
                  </button>
                </div>

                <div style={{ marginTop: 18, fontSize: 10, color: "#4A4A42", letterSpacing: "0.04em", lineHeight: 1.7 }}>
                  First shipment ships within 48 hours. Subscriptions are processed as individual discounted orders — we'll contact you before each renewal.
                </div>
              </div>
            ) : (
              <div style={{ border: "1px dashed rgba(212,175,55,0.18)", padding: "48px 32px", textAlign: "center", fontSize: 11, color: "#4A4A42", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                Select a tier above to configure your subscription
              </div>
            )}

            <div style={{ marginTop: 56, padding: "18px 28px", border: "1px solid rgba(212,175,55,0.07)", fontSize: 11, color: "#3A3A32", lineHeight: 1.8, textAlign: "center" }}>
              <strong style={{ color: "#5A5A52" }}>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only. Not for human or animal consumption. Not for use in diagnostic or therapeutic applications.
            </div>
          </div>
        )}

        {/* ── Cart ── */}
        {section === "cart" && (
          <div className="fade-section">
            <div className="section-eyebrow">Order</div>
            <h2 className="section-h2" style={{ fontFamily: "'Cinzel', serif", fontSize: 34, fontWeight: 400, letterSpacing: "0.05em", marginBottom: 52 }}>Your Cart</h2>

            {paid ? (
              <div className="empty-cart" style={{ textAlign: "center", padding: "72px 0" }}>
                <div className="gold-text" style={{ fontFamily: "'Cinzel', serif", fontSize: 44, marginBottom: 16 }}>◈</div>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 400, letterSpacing: "0.08em", marginBottom: 14 }}>Order Received</h3>
                {orderInfo?.orderId && (
                  <div style={{ fontSize: 11, color: "#D4AF37", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
                    Order #{String(orderInfo.orderId).slice(0, 8).toUpperCase()}
                  </div>
                )}
                <p style={{ fontSize: 13, color: "#5A5A52", lineHeight: 1.8, marginBottom: 8, maxWidth: 400, margin: "0 auto 10px" }}>
                  Payment sent. We'll ship to <strong style={{ color: "#F0EFE8" }}>{ship.name}</strong> within 1–2 business days.
                </p>
                {orderWarning ? (
                  <p style={{ fontSize: 12, color: "#C2873B", lineHeight: 1.7, maxWidth: 440, margin: "0 auto 24px" }}>
                    Your payment went through, but we hit a snag recording the order. Please email{" "}
                    <strong style={{ color: "#F0EFE8" }}>support@ace-peptides.com</strong> with the transaction hash below and we'll confirm your shipment right away.
                  </p>
                ) : orderInfo?.paymentStatus === "verified" ? (
                  <p style={{ fontSize: 12, color: "#4A4A42", marginBottom: 24 }}>
                    Confirmation sent to {ship.email}.
                  </p>
                ) : (
                  <p style={{ fontSize: 12, color: "#4A4A42", lineHeight: 1.7, maxWidth: 420, margin: "0 auto 24px" }}>
                    Your payment is confirming on-chain — we'll email your confirmation to {ship.email} once it clears (usually within the hour).
                  </p>
                )}
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "#3A3A32", wordBreak: "break-all", maxWidth: 480, margin: "0 auto 32px", padding: "12px 16px", border: "1px solid rgba(212,175,55,0.1)" }}>
                  Tx: {txHash}
                </div>
                <button className="btn-outline-gold" onClick={() => { setPaid(false); setOrderWarning(false); setTxHash(null); setOrderInfo(null); setSection("products"); }}>
                  Continue Shopping
                </button>
              </div>
            ) : cart.length === 0 ? (
              PAYMENTS_FROZEN ? (
                <WaitlistPanel defaultProduct="" />
              ) : (
                <div className="empty-cart" style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 20, opacity: 0.2, color: "#D4AF37" }}>◈</div>
                  <p style={{ fontSize: 13, marginBottom: 28, color: "#4A4A42" }}>Your cart is empty.</p>
                  <button className="btn-outline-gold" onClick={() => setSection("products")}>Browse Products</button>
                </div>
              )
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="cart-item-row cart-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0" }}>
                    <div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 400, letterSpacing: "0.04em", marginBottom: 12 }}>{item.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ border: "1px solid rgba(212,175,55,0.25)", background: "none", width: 26, height: 26, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37" }}>−</button>
                        <span style={{ fontSize: 13, color: "#6A6A60", minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}  style={{ border: "1px solid rgba(212,175,55,0.25)", background: "none", width: 26, height: 26, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37" }}>+</button>
                        <button onClick={() => removeFromCart(item.id)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 9, color: "#804040", letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", fontWeight: 600, padding: "0 4px" }}>Remove</button>
                      </div>
                    </div>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 20, background: "linear-gradient(90deg,#9A7A1A,#F5D07A,#D4AF37,#F5D07A,#9A7A1A)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 5s linear infinite" }}>
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}

                {PAYMENTS_FROZEN && (
                  <WaitlistPanel defaultProduct={products.find((p) => cart.some((c) => c.name && c.name.startsWith(p.name)))?.name || ""} />
                )}
                {!PAYMENTS_FROZEN && (<>
                <div style={{ padding: "20px 0", borderTop: "1px solid rgba(212,175,55,0.15)" }}>
                  {/* Promo code input */}
                  {!promoCode ? (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 20 }}>
                      <div style={{ flex: 1 }}>
                        <label className="calc-label">Promo / Affiliate Code</label>
                        <input
                          className="ship-input" type="text"
                          placeholder="Enter code"
                          value={promoInput}
                          onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                          onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                          style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}
                        />
                        {promoError && <div style={{ fontSize: 10, color: "#B04040", marginTop: 6 }}>{promoError}</div>}
                      </div>
                      <button className="btn-outline-gold" style={{ padding: "10px 20px", flexShrink: 0 }} onClick={applyPromo} disabled={promoLoading}>
                        {promoLoading ? "…" : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "10px 14px", border: "1px solid rgba(112,168,112,0.3)", background: "rgba(80,128,80,0.06)" }}>
                      <span style={{ fontSize: 11, color: "#70a870" }}>
                        ✓ <strong>{promoCode}</strong> — {promoDiscount}% off applied
                      </span>
                      <button onClick={removePromo} style={{ background: "none", border: "none", color: "#5A5A52", cursor: "pointer", fontSize: 11 }}>✕</button>
                    </div>
                  )}

                  {/* Order total */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6A6A60" }}>Total</span>
                    <div style={{ textAlign: "right" }}>
                      {promoCode && (
                        <div style={{ fontSize: 14, color: "#4A4A42", textDecoration: "line-through", fontFamily: "'Cinzel', serif", marginBottom: 2 }}>
                          ${cartTotal.toFixed(2)}
                        </div>
                      )}
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 28, background: "linear-gradient(90deg,#9A7A1A,#F5D07A,#D4AF37,#F5D07A,#9A7A1A)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 5s linear infinite" }}>
                        ${discountedTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping information */}
                <div style={{ marginBottom: 32, padding: "28px 28px 24px", border: "1px solid rgba(212,175,55,0.18)", background: "rgba(212,175,55,0.02)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 22, color: "#D4AF37" }}>
                    Shipping Information
                  </div>
                  <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 28px", marginBottom: 20 }}>
                    <div>
                      <label className="calc-label">Full Name</label>
                      <input className="ship-input" type="text" placeholder="Jane Smith" value={ship.name} onChange={(e) => setShip((s) => ({ ...s, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="calc-label">Email</label>
                      <input className="ship-input" type="email" placeholder="jane@example.com" value={ship.email} onChange={(e) => setShip((s) => ({ ...s, email: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label className="calc-label">Street Address</label>
                    <input className="ship-input" type="text" placeholder="123 Main St, Apt 4B" value={ship.address} onChange={(e) => setShip((s) => ({ ...s, address: e.target.value }))} />
                  </div>
                  <div className="ship-addr-grid">
                    <div>
                      <label className="calc-label">City</label>
                      <input className="ship-input" type="text" value={ship.city} onChange={(e) => setShip((s) => ({ ...s, city: e.target.value }))} />
                    </div>
                    <div>
                      <label className="calc-label">State</label>
                      <input className="ship-input" type="text" placeholder="CA" maxLength={2} value={ship.state} onChange={(e) => setShip((s) => ({ ...s, state: e.target.value.toUpperCase() }))} />
                    </div>
                    <div>
                      <label className="calc-label">ZIP</label>
                      <input className="ship-input" type="text" value={ship.zip} onChange={(e) => setShip((s) => ({ ...s, zip: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* T&C checkbox */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "18px 0 10px" }}>
                  <input
                    type="checkbox" id="checkout-terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    style={{ marginTop: 3, accentColor: "#D4AF37", cursor: "pointer", flexShrink: 0 }}
                  />
                  <label htmlFor="checkout-terms" style={{ fontSize: 11, color: "#5A5A52", lineHeight: 1.7, cursor: "pointer" }}>
                    I have read and agree to the{" "}
                    <span
                      onClick={(e) => { e.preventDefault(); setShowCheckoutTerms(true); }}
                      style={{ color: "#D4AF37", textDecoration: "underline", cursor: "pointer" }}
                    >
                      Terms &amp; Conditions
                    </span>
                    {" "}and confirm this purchase is solely for legitimate laboratory research purposes.
                  </label>
                </div>

                {/* Payment — only active once shipping + terms are done */}
                {(!shipFilled || !termsAccepted) && (
                  <div style={{ fontSize: 10, color: "#4A4A42", letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", padding: "8px 0 20px" }}>
                    {!shipFilled ? "Complete shipping information above to continue" : "Accept terms & conditions to continue"}
                  </div>
                )}
                <div className="wallet-box" style={{ opacity: (shipFilled && termsAccepted) ? 1 : 0.35, pointerEvents: (shipFilled && termsAccepted) ? "auto" : "none", transition: "opacity 0.3s" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 12, color: "#D4AF37" }}>Pay with Crypto</div>
                  <div style={{ fontSize: 12, color: "#5A5A52", marginBottom: 20, lineHeight: 1.75 }}>
                    Connect your wallet to pay in USDC (stablecoin) or ETH — instant settlement, no middlemen.
                  </div>
                  {txHash ? (
                    <>
                      <div className="success-msg">Payment sent successfully.</div>
                      <div className="tx-hash">Tx: {txHash}</div>
                    </>
                  ) : walletAddress ? (
                    <>
                      <div style={{ fontSize: 10, color: "#4A4A42", letterSpacing: "0.12em", textTransform: "uppercase" }}>Connected</div>
                      <div className="wallet-address">{walletAddress}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                        <button className="btn-gold" style={{ width: "100%", padding: 16 }} onClick={payWithUSDC} disabled={paymentLoading}>
                          {paymentLoading ? "Awaiting wallet…" : `Pay $${discountedTotal.toFixed(2)} in USDC`}
                        </button>
                        <button className="btn-outline-gold" style={{ width: "100%", padding: 14 }} onClick={payWithWallet} disabled={paymentLoading}>
                          {paymentLoading ? "Awaiting wallet…" : `Pay $${discountedTotal.toFixed(2)} in ETH`}
                        </button>
                      </div>
                      <div style={{ fontSize: 9, color: "#3A3A32", letterSpacing: "0.10em", textAlign: "center", marginTop: 10 }}>
                        USDC = no price fluctuation · ETH = live market rate
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <button className="btn-gold" style={{ width: "100%", padding: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} onClick={connectCoinbase}>
                        <svg width="18" height="18" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#0052FF"/><path d="M14 6C9.582 6 6 9.582 6 14s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm-2.5 10.5v-5h5v5h-5z" fill="#fff"/></svg>
                        Connect Coinbase Wallet
                      </button>
                      <button className="btn-outline-gold" style={{ width: "100%", padding: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} onClick={connectMetaMask}>
                        <svg width="18" height="18" viewBox="0 0 35 33" fill="none"><path d="M32.958 1L19.4 10.71l2.522-5.962L32.958 1z" fill="#E17726"/><path d="M2.042 1l13.44 9.808-2.4-5.96L2.042 1z" fill="#E27625"/><path d="M28.18 23.26l-3.6 5.51 7.7 2.12 2.21-7.52-6.31-.11z" fill="#E27625"/><path d="M.53 23.37l2.2 7.52 7.69-2.12-3.59-5.51-6.3.11z" fill="#E27625"/></svg>
                        Connect MetaMask
                      </button>
                    </div>
                  )}
                  {walletError && <div className="error-msg">{walletError}</div>}

                  {/* Manual payment — send from any wallet or exchange, paste the tx hash */}
                  {!txHash && (
                    <div style={{ marginTop: 22 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "0 0 16px" }}>
                        <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.12)" }} />
                        <span style={{ fontSize: 9, color: "#4A4A42", letterSpacing: "0.18em", textTransform: "uppercase" }}>or</span>
                        <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.12)" }} />
                      </div>

                      {!manualOpen ? (
                        <button className="btn-outline-gold" style={{ width: "100%", padding: 14 }} onClick={() => { setManualOpen(true); setManualError(null); }}>
                          Pay from any wallet or exchange
                        </button>
                      ) : (
                        <div style={{ border: "1px solid rgba(212,175,55,0.18)", padding: "20px 18px" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 6 }}>
                            Pay from any wallet or exchange
                          </div>
                          <div style={{ fontSize: 11, color: "#5A5A52", lineHeight: 1.7, marginBottom: 14 }}>
                            Send the exact amount from Coinbase, Kraken, or any crypto wallet, then paste the transaction hash below.
                          </div>

                          {/* Currency toggle */}
                          <div className="seg-group" style={{ marginBottom: 14 }}>
                            {[["usdc", "USDC — recommended"], ["eth", "ETH"]].map(([c, label]) => (
                              <button key={c} type="button" className={`seg-btn ${manualCurrency === c ? "active" : ""}`} onClick={() => selectManualCurrency(c)}>
                                {label}
                              </button>
                            ))}
                          </div>

                          {/* Amount */}
                          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 22 }} className="gold-text">
                              {manualCurrency === "usdc"
                                ? `${discountedTotal.toFixed(2)} USDC`
                                : manualEthQuote === "loading" || !manualEthQuote
                                ? "…"
                                : `${manualEthQuote.eth.toFixed(6)} ETH`}
                            </span>
                            <button
                              type="button"
                              className="btn-outline-gold"
                              style={{ padding: "4px 10px", fontSize: 8 }}
                              onClick={() =>
                                manualCurrency === "usdc"
                                  ? copyToClipboard("amount", discountedTotal.toFixed(2))
                                  : manualEthQuote && manualEthQuote !== "loading" && copyToClipboard("amount", manualEthQuote.eth.toFixed(6))
                              }
                            >
                              {copiedField === "amount" ? "Copied ✓" : "Copy amount"}
                            </button>
                            {manualCurrency === "eth" && (
                              <button type="button" className="btn-outline-gold" style={{ padding: "4px 10px", fontSize: 8 }} onClick={fetchManualEthQuote}>
                                ↻ Refresh quote
                              </button>
                            )}
                          </div>
                          {manualCurrency === "eth" && (
                            <div style={{ fontSize: 9, color: "#4A4A42", lineHeight: 1.6, marginBottom: 10 }}>
                              Live quote (includes a 1% buffer for price movement) — send within ~10 minutes, or refresh.
                            </div>
                          )}
                          {manualCurrency === "usdc" && <div style={{ marginBottom: 10 }} />}

                          {/* Network warning — funds sent on the wrong chain are unrecoverable */}
                          <div style={{ fontSize: 10, color: "#C2873B", lineHeight: 1.7, padding: "10px 12px", border: "1px solid rgba(194,135,59,0.3)", marginBottom: 16 }}>
                            ⚠ Send on <strong>Ethereum mainnet (ERC-20) only.</strong> Funds sent on Base, Polygon, Solana, or any other network cannot be detected or recovered.
                          </div>

                          {/* Address + QR */}
                          <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "center", marginBottom: 16 }}>
                            <div style={{ background: "#F0EFE8", padding: 10, width: "fit-content" }}>
                              <QRCodeSVG value={RECIPIENT_ADDRESS} size={128} bgColor="#F0EFE8" fgColor="#080808" />
                            </div>
                            <div>
                              <div style={{ fontSize: 9, color: "#4A4A42", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
                                Send to this address
                              </div>
                              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#F0EFE8", wordBreak: "break-all", lineHeight: 1.6, marginBottom: 10 }}>
                                {RECIPIENT_ADDRESS}
                              </div>
                              <button type="button" className="btn-outline-gold" style={{ padding: "6px 14px", fontSize: 8 }} onClick={() => copyToClipboard("address", RECIPIENT_ADDRESS)}>
                                {copiedField === "address" ? "Copied ✓" : "Copy address"}
                              </button>
                            </div>
                          </div>

                          {/* Tx hash confirm */}
                          <label className="calc-label" style={{ marginBottom: 6, display: "block" }}>
                            Transaction hash (from your wallet or exchange history)
                          </label>
                          <input
                            className="calc-input"
                            type="text"
                            placeholder="0x…"
                            value={manualTxInput}
                            onChange={(e) => { setManualTxInput(e.target.value); setManualError(null); }}
                            style={{ fontFamily: "monospace", fontSize: 12, marginBottom: 12 }}
                          />
                          <button
                            className="btn-gold"
                            style={{ width: "100%", padding: 15 }}
                            onClick={confirmManualPayment}
                            disabled={paymentLoading || (manualCurrency === "eth" && (!manualEthQuote || manualEthQuote === "loading"))}
                          >
                            {paymentLoading ? "Verifying…" : "I've sent it — confirm my order"}
                          </button>
                          {manualError && <div className="error-msg">{manualError}</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </>)}

                <div style={{ marginTop: 24, fontSize: 11, color: "#3A3A32", lineHeight: 1.75, textAlign: "center" }}>
                  <strong style={{ color: "#4A4A42" }}>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only. Not for human or animal consumption.
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <div className="divider-gold" />
      <footer className="footer-bar" style={{ padding: "26px 56px", display: "flex", justifyContent: "space-between", fontSize: 9, color: "#2A2A22", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        <span>© 2026 Ace Peptides — All products for laboratory research use only.</span>
        <span style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {[["Terms", "terms"], ["Privacy", "privacy"]].map(([label, key]) => (
            <button key={key} onClick={() => setLegalModal(key)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#2A2A22", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", transition: "color .2s", padding: 0 }}
              onMouseEnter={(e) => (e.target.style.color = "#D4AF37")}
              onMouseLeave={(e) => (e.target.style.color = "#2A2A22")}>
              {label}
            </button>
          ))}
          <span style={{ color: "#3A3A32" }}>·</span>
          <button onClick={() => { setSection("support"); window.scrollTo({ top: 0 }); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#2A2A22", transition: "color .2s", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}
            onMouseEnter={(e) => (e.target.style.color = "#D4AF37")}
            onMouseLeave={(e) => (e.target.style.color = "#2A2A22")}>
            Contact
          </button>
        </span>
      </footer>

      <Analytics />
      <SpeedInsights />

      {/* Checkout T&C detail modal */}
      {showCheckoutTerms && (
        <div className="modal-overlay" onClick={() => setShowCheckoutTerms(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCheckoutTerms(false)}>×</button>
            <div className="modal-h">Terms &amp; Conditions of Sale</div>
            <div className="modal-sub">Research Compounds — Liability Waiver</div>
            <p style={{ fontSize: 10, color: "#4A4A42", lineHeight: 1.9, marginBottom: 16 }}>
              BY COMPLETING THIS PURCHASE YOU ACKNOWLEDGE, REPRESENT, AND AGREE TO ALL OF THE FOLLOWING:
            </p>
            <p style={{ fontSize: 9, color: "#3A3A32", lineHeight: 2, letterSpacing: "0.01em" }}>
              (i) All products sold by Ace Peptides are strictly for in-vitro laboratory research use only and are not intended, sold, or suitable for human or animal consumption, therapeutic use, or any clinical, diagnostic, or medical application whatsoever. (ii) You are a qualified researcher, licensed laboratory professional, or authorized institutional buyer of legal age in your jurisdiction and you possess the knowledge and facilities required for the safe handling of research-grade compounds. (iii) You have independently verified that the purchase, possession, handling, and intended use of these compounds is lawful in your jurisdiction and you assume sole and complete responsibility for compliance with all applicable federal, state, provincial, and local laws, regulations, and ordinances. (iv) You acknowledge that research compounds carry inherent risks, including but not limited to chemical exposure, improper handling, and unknown long-term effects, and that these risks are your sole responsibility. (v) ACE PEPTIDES, ITS PRINCIPALS, OFFICERS, EMPLOYEES, AGENTS, AFFILIATES, SUCCESSORS, AND ASSIGNS EXPRESSLY DISCLAIM, TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, ALL LIABILITY OF ANY KIND — INCLUDING WITHOUT LIMITATION ANY LIABILITY FOR PERSONAL INJURY, DEATH, PROPERTY DAMAGE, FINANCIAL LOSS, OR ANY OTHER DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES — ARISING FROM OR IN ANY WAY RELATED TO THE PURCHASE, HANDLING, STORAGE, RECONSTITUTION, ADMINISTRATION, INJECTION, INGESTION, OR ANY OTHER USE OF ANY PRODUCT PURCHASED FROM THIS SITE, WHETHER SUCH USE IS FOR ITS INTENDED RESEARCH PURPOSE OR OTHERWISE. (vi) You expressly waive any and all claims, actions, demands, and causes of action against Ace Peptides and its related parties arising out of or related to your purchase or any subsequent use of the products. (vii) This waiver and disclaimer shall be enforceable to the maximum extent permitted by law. If any provision is held unenforceable, the remaining provisions shall remain in full force and effect. (viii) By checking the acceptance box and completing your purchase, you confirm that you have read, understood, and voluntarily agreed to be bound by these terms without duress or undue influence.
            </p>
            <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-gold" style={{ padding: "10px 28px" }} onClick={() => { setTermsAccepted(true); setShowCheckoutTerms(false); }}>
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal modal */}
      {legalModal && (
        <div className="modal-overlay" onClick={() => setLegalModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setLegalModal(null)}>×</button>

            {legalModal === "terms" ? (
              <>
                <div className="modal-h">Terms of Use</div>
                <div className="modal-sub">Effective January 1, 2026</div>

                <div className="modal-section">Research Use Only</div>
                <p className="modal-p">All products sold by Ace Peptides are intended strictly for in-vitro laboratory research purposes only. They are not intended for human or animal consumption, nor for use in diagnostic, therapeutic, or any clinical applications. By purchasing, you confirm that you are a qualified researcher, academic institution, or licensed laboratory.</p>

                <div className="modal-section">Eligibility</div>
                <p className="modal-p">You must be 18 years of age or older and legally permitted to purchase research chemicals in your jurisdiction. It is your responsibility to ensure compliance with all applicable local, state, and federal laws.</p>

                <div className="modal-section">Payment</div>
                <p className="modal-p">All payments are made in ETH via your connected wallet. Transactions are final once broadcast to the blockchain. Exchange rate is calculated at time of checkout using live market data.</p>

                <div className="modal-section">Shipping & Fulfillment</div>
                <p className="modal-p">Orders are processed and shipped within 1–2 business days. We ship discreetly. Risk of loss passes to the buyer upon delivery to the carrier. We are not responsible for packages seized by customs in jurisdictions where these compounds are restricted.</p>

                <div className="modal-section">Returns</div>
                <p className="modal-p">Unopened, undamaged items may be returned within 30 days of delivery for a refund minus shipping costs. Contact us before returning any item. Opened vials cannot be returned due to the nature of research compounds.</p>

                <div className="modal-section">Disclaimer</div>
                <p className="modal-p">Ace Peptides makes no representations regarding the fitness of products for any particular purpose. All information provided is for informational purposes only and does not constitute medical or scientific advice.</p>
              </>
            ) : (
              <>
                <div className="modal-h">Privacy Policy</div>
                <div className="modal-sub">Effective January 1, 2026</div>

                <div className="modal-section">Information We Collect</div>
                <p className="modal-p">When you place an order, we collect your name, email address, and shipping address solely for the purpose of fulfilling your order. We do not collect payment card data — payments are processed directly on the Ethereum blockchain via your own wallet.</p>

                <div className="modal-section">How We Use Your Information</div>
                <p className="modal-p">Your information is used exclusively to process and ship your order and to send you order confirmation and status emails. We do not use it for marketing without your explicit consent.</p>

                <div className="modal-section">Data Sharing</div>
                <p className="modal-p">We do not sell, rent, or share your personal information with third parties, except as required to fulfill your shipment (e.g., carrier handoff) or as required by law.</p>

                <div className="modal-section">Blockchain Transactions</div>
                <p className="modal-p">ETH transactions are recorded on the public Ethereum blockchain. Your wallet address and transaction amount are publicly visible on-chain. We have no control over this data.</p>

                <div className="modal-section">Data Retention</div>
                <p className="modal-p">Order records are retained for a minimum of 3 years for legal and accounting purposes. You may request deletion of your personal data (name, email, address) by contacting us, subject to legal retention requirements.</p>

                <div className="modal-section">Contact</div>
                <p className="modal-p">For any privacy-related inquiries, contact us at support@ace-peptides.com.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
