import { useState, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

const RECIPIENT_ADDRESS = "0x74e9af21c6060328371b3813689b472132f89cbd";
const coinbaseWallet = new CoinbaseWalletSDK({ appName: "Ace Peptides" });
const coinbaseProvider = coinbaseWallet.makeWeb3Provider();

const products = [
  { id: 1, name: "Retatrutide 5mg",  purity: "≥99.1%", form: "Lyophilized Powder", cas: "2381089-83-2", price: 50.00,  stock: true },
  { id: 2, name: "Retatrutide 10mg", purity: "≥99.1%", form: "Lyophilized Powder", cas: "2381089-83-2", price: 85.00,  stock: true },
  { id: 3, name: "Retatrutide 15mg", purity: "≥99.1%", form: "Lyophilized Powder", cas: "2381089-83-2", price: 100.00, stock: true },
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

const SvgDefs = () => (
  <svg width="0" height="0" style={{ position: "absolute", overflow: "hidden" }}>
    <defs>
      <linearGradient id="ap-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#F5D07A" />
        <stop offset="45%"  stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#9A7A1A" />
      </linearGradient>
      {/* Diagonal gradient so it follows the orbital arc direction */}
      <linearGradient id="ap-silver" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="rgba(200,200,200,0)" />
        <stop offset="28%"  stopColor="#C0C0C0" />
        <stop offset="52%"  stopColor="#F4F4F4" />
        <stop offset="74%"  stopColor="#C8C8C8" />
        <stop offset="100%" stopColor="rgba(200,200,200,0)" />
      </linearGradient>
      {/* Outer glow for spade body */}
      <filter id="ap-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* Tight glow for molecular nodes and "A" */}
      <filter id="ap-node-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="1.6" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* Soft spread glow for the silver orbital streak */}
      <filter id="ap-streak-glow" x="-15%" y="-80%" width="130%" height="260%">
        <feGaussianBlur stdDeviation="2.4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

const SpadeIcon = ({ size = 80 }) => (
  <svg width={size} height={size * 1.18} viewBox="-20 -12 140 145" fill="none" xmlns="http://www.w3.org/2000/svg">

    {/* ── LAYER 1: Silver orbital arc drawn FIRST ──
        Spade fill is opaque so it covers the arc in the middle,
        making the arc appear to wrap behind the spade. */}
    <path d="M -16 88 Q 50 -20 118 20"
      stroke="url(#ap-silver)" strokeWidth="2.6" fill="none"
      filter="url(#ap-streak-glow)" />

    {/* ── LAYER 2: Spade body ── */}
    <path
      d="M50 5 C60 12,92 28,92 52 C92 72,76 80,60 72 C64 83,70 88,78 93 L22 93 C30 88,36 83,40 72 C24 80,8 72,8 52 C8 28,40 12,50 5Z"
      fill="#0C0C0C"
      stroke="url(#ap-gold)" strokeWidth="2.4"
      filter="url(#ap-glow)"
    />
    {/* Inset highlight — gives the spade 3D engraved depth */}
    <path
      d="M50 11 C59 17,86 31,86 53 C86 70,73 79,60 72 C63 82,68 87,75 91 L25 91 C32 87,37 82,40 72 C27 79,14 70,14 53 C14 31,41 17,50 11Z"
      stroke="url(#ap-gold)" strokeWidth="0.85" fill="none" opacity="0.24"
    />

    {/* Base foot */}
    <rect x="43" y="93" width="14" height="5.5" rx="2" fill="url(#ap-gold)" opacity="0.62" />

    {/* ── LAYER 3: Molecular A-network ── */}
    <line x1="50" y1="20" x2="40" y2="37" stroke="url(#ap-gold)" strokeWidth="1.15" opacity="0.8" />
    <line x1="50" y1="20" x2="60" y2="37" stroke="url(#ap-gold)" strokeWidth="1.15" opacity="0.8" />
    <line x1="40" y1="37" x2="32" y2="55" stroke="url(#ap-gold)" strokeWidth="1.15" opacity="0.74" />
    <line x1="60" y1="37" x2="68" y2="55" stroke="url(#ap-gold)" strokeWidth="1.15" opacity="0.74" />
    <line x1="32" y1="55" x2="25" y2="72" stroke="url(#ap-gold)" strokeWidth="1"   opacity="0.66" />
    <line x1="68" y1="55" x2="75" y2="72" stroke="url(#ap-gold)" strokeWidth="1"   opacity="0.66" />
    <line x1="37" y1="49" x2="63" y2="49" stroke="url(#ap-gold)" strokeWidth="1"   opacity="0.62" />

    {/* Nodes */}
    <circle cx="50" cy="20" r="4.4" fill="url(#ap-gold)" filter="url(#ap-node-glow)" />
    <circle cx="40" cy="37" r="2.8" fill="url(#ap-gold)" filter="url(#ap-node-glow)" />
    <circle cx="60" cy="37" r="2.8" fill="url(#ap-gold)" filter="url(#ap-node-glow)" />
    <circle cx="32" cy="55" r="2.4" fill="url(#ap-gold)" />
    <circle cx="68" cy="55" r="2.4" fill="url(#ap-gold)" />
    <circle cx="25" cy="72" r="2.8" fill="url(#ap-gold)" />
    <circle cx="75" cy="72" r="2.8" fill="url(#ap-gold)" />
    <circle cx="37" cy="49" r="1.7" fill="url(#ap-gold)" opacity="0.92" />
    <circle cx="63" cy="49" r="1.7" fill="url(#ap-gold)" opacity="0.92" />

    {/* Central "A" */}
    <text x="50" y="60" textAnchor="middle" dominantBaseline="middle"
      fontFamily="'Cinzel', serif" fontSize="26" fontWeight="700"
      fill="url(#ap-gold)" filter="url(#ap-node-glow)" opacity="0.97">A</text>

    {/* ── LAYER 4: 4-pointed star focus point at base ── */}
    <path d="M50 100 L52.2 105.8 L58.2 106.8 L52.2 107.8 L50 113.5 L47.8 107.8 L41.8 106.8 L47.8 105.8 Z"
          fill="#D2D2D2" opacity="0.96" filter="url(#ap-node-glow)" />
  </svg>
);

// Playing-card spread component
function CardSpread({ products, onAdd }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

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

  return (
    <div
      style={{ position: "relative", height: 430, display: "flex", alignItems: "center", justifyContent: "center", cursor: open ? "default" : "pointer" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { setOpen(false); setActive(null); }}
    >
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
            onClick={() => open && onAdd(p)}
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

            {/* Center content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <SpadeIcon size={64} />
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
              </div>
              <div style={{
                marginTop: 8,
                background: isActive ? "linear-gradient(135deg, #9A7A1A, #D4AF37, #F5D07A)" : "transparent",
                border: isActive ? "none" : "1px solid rgba(212,175,55,0.25)",
                color: isActive ? "#000" : "#5A5A52",
                padding: "9px 22px",
                fontSize: 9,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                fontWeight: 700,
                fontFamily: "'Montserrat', sans-serif",
                transition: "background 0.3s, color 0.3s, border 0.3s",
              }}>
                {isActive ? "Add to Cart" : "— view —"}
              </div>
            </div>

            {/* Bottom-right corner pip (rotated 180°) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.1, transform: "rotate(180deg)", zIndex: 1 }}>
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

export default function App() {
  const [section, setSection] = useState("products");
  const [cart, setCart] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [walletError, setWalletError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const activeProvider = useRef(null);

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

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);

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
      const ethAmount = cartTotal / ethPrice;
      const weiAmount = BigInt(Math.round(ethAmount * 1e14)) * 10000n;
      const hexValue  = "0x" + weiAmount.toString(16);
      const tx = await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: walletAddress, to: RECIPIENT_ADDRESS, value: hexValue }],
      });
      setTxHash(tx);
    } catch (err) {
      setWalletError(err.message || "Transaction failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (process.env.REACT_APP_KILL_SWITCH === "true") {
    return (
      <div style={{ fontFamily: "'Montserrat', sans-serif", background: "#080808", color: "#F0EFE8", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Montserrat:wght@400;500&display=swap'); * { margin:0; padding:0; box-sizing:border-box; }`}</style>
        <SvgDefs />
        <SpadeIcon size={64} />
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 24, letterSpacing: "0.2em" }}>ACE PEPTIDES</span>
        <p style={{ fontSize: 11, color: "#4A4A42", letterSpacing: "0.15em", textTransform: "uppercase" }}>Temporarily Unavailable</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", background: "#080808", color: "#F0EFE8", minHeight: "100vh", position: "relative" }}>
      <SvgDefs />

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
      <header style={{
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
          <div className="logo-glow"><SpadeIcon size={34} /></div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, letterSpacing: "0.2em", color: "#F0EFE8" }}>ACE</div>
            <div style={{ fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "#4A4A42", marginTop: 3 }}>PEPTIDES</div>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 36, alignItems: "center" }}>
          {[["products", "Products"], ["research", "Research"], ["faq", "FAQ"]].map(([key, label]) => (
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

      <div className="divider-gold" />

      <main style={{ maxWidth: 1060, margin: "0 auto", padding: "72px 32px 140px", position: "relative", zIndex: 1 }}>

        {/* ── Products ── */}
        {section === "products" && (
          <div className="fade-section">

            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 96 }}>
              <div className="logo-float logo-glow" style={{ display: "inline-block", marginBottom: 28 }}>
                <SpadeIcon size={110} />
              </div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 54, fontWeight: 400, letterSpacing: "0.22em", lineHeight: 1 }}>
                <span className="gold-text">ACE</span>
              </div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: "0.36em", color: "#3A3A32", marginTop: 6, marginBottom: 22 }}>
                PEPTIDES
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, color: "#3A3A32", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 18 }}>
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
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 26, fontWeight: 400, letterSpacing: "0.08em", marginBottom: 10 }}>
                Retatrutide
              </h2>
              <p style={{ fontSize: 12, color: "#4A4A42", lineHeight: 1.75, maxWidth: 440, margin: "0 auto" }}>
                HPLC-verified ≥99% purity · Lyophilized Powder · For in-vitro and laboratory research only
              </p>
            </div>

            {/* Card spread — main product interaction */}
            <CardSpread products={products} onAdd={addToCart} />

            {/* Spacer for hint text */}
            <div style={{ height: 68 }} />

            {/* Quick-spec strip */}
            <div style={{ display: "flex", gap: 2, marginBottom: 56 }}>
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
                </div>
              ))}
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
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 34, fontWeight: 400, letterSpacing: "0.05em", marginBottom: 28 }}>Retatrutide Overview</h2>
            <p style={{ fontSize: 13, color: "#5A5A52", marginBottom: 18, lineHeight: 1.88, maxWidth: 580 }}>
              Retatrutide (LY3437943) is a synthetic peptide studied in metabolic and endocrine research. It functions as a triple receptor agonist, interacting with GLP-1, GIP, and glucagon receptors involved in energy balance and glucose regulation.
            </p>
            <p style={{ fontSize: 13, color: "#5A5A52", marginBottom: 64, lineHeight: 1.88, maxWidth: 580 }}>
              In controlled research settings, activation of these pathways has been associated with effects on appetite signaling, metabolic activity, and glucose-related markers. Retatrutide continues to be studied for its role in metabolic research.
            </p>
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
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 34, fontWeight: 400, letterSpacing: "0.05em", marginBottom: 52 }}>Frequently Asked</h2>
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

        {/* ── Cart ── */}
        {section === "cart" && (
          <div className="fade-section">
            <div className="section-eyebrow">Order</div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 34, fontWeight: 400, letterSpacing: "0.05em", marginBottom: 52 }}>Your Cart</h2>

            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 20, opacity: 0.2, color: "#D4AF37" }}>◈</div>
                <p style={{ fontSize: 13, marginBottom: 28, color: "#4A4A42" }}>Your cart is empty.</p>
                <button className="btn-outline-gold" onClick={() => setSection("products")}>Browse Products</button>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="cart-item-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0" }}>
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

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 0", borderTop: "1px solid rgba(212,175,55,0.15)" }}>
                  <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6A6A60" }}>Total</span>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 28, background: "linear-gradient(90deg,#9A7A1A,#F5D07A,#D4AF37,#F5D07A,#9A7A1A)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 5s linear infinite" }}>
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>

                <div className="wallet-box">
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 12, color: "#D4AF37" }}>Pay with Crypto</div>
                  <div style={{ fontSize: 12, color: "#5A5A52", marginBottom: 20, lineHeight: 1.75 }}>
                    Connect your wallet to send ETH directly — instant settlement, no middlemen.
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
                      <button className="btn-gold" style={{ width: "100%", padding: 16, marginTop: 16 }} onClick={payWithWallet} disabled={paymentLoading}>
                        {paymentLoading ? "Awaiting wallet…" : `Pay $${cartTotal.toFixed(2)} in ETH`}
                      </button>
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
                </div>

                <div style={{ marginTop: 24, fontSize: 11, color: "#3A3A32", lineHeight: 1.75, textAlign: "center" }}>
                  <strong style={{ color: "#4A4A42" }}>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only. Not for human or animal consumption.
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <div className="divider-gold" />
      <footer style={{ padding: "26px 56px", display: "flex", justifyContent: "space-between", fontSize: 9, color: "#2A2A22", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        <span>© 2026 Ace Peptides — All products for laboratory research use only.</span>
        <span>Terms · Privacy · Contact</span>
      </footer>

      <Analytics />
      <SpeedInsights />
    </div>
  );
}
