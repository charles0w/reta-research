import { useState, useEffect, useMemo } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const ACE_TOKENS = {
  bg: "#030303",
  panel: "#0A0A0A",
  ink0: "#F0EFE8",
  ink1: "#C8C6B8",
  ink2: "#8A8878",
  ink3: "#5A5A52",
  ink4: "#3A3A32",
  ink5: "#1F1F1A",
  gold1: "#7A5D12",
  gold2: "#9A7A1A",
  gold3: "#D4AF37",
  gold4: "#F5D07A",
  green: "#508050",
  red: "#B04040",
  fontBody: "'Inter', sans-serif",
  fontDisplay: "'JetBrains Mono', monospace",
  fontSerif: "'Cinzel', serif",
};

const ACE_PRODUCTS = [
  { id: 1, name: "Retatrutide 5mg", mg: 5, purity: "\u226599.1%", form: "Lyophilized Powder", cas: "2381089-83-2", batch: "RTT-260A", yield: "5.0mg", price: 50.0, stock: true },
  { id: 2, name: "Retatrutide 10mg", mg: 10, purity: "\u226599.1%", form: "Lyophilized Powder", cas: "2381089-83-2", batch: "RTT-260B", yield: "10.0mg", price: 85.0, stock: true },
  { id: 3, name: "Retatrutide 15mg", mg: 15, purity: "\u226599.1%", form: "Lyophilized Powder", cas: "2381089-83-2", batch: "RTT-260C", yield: "15.0mg", price: 100.0, stock: true },
];

const ACE_FINDINGS = [
  { metric: "17.5%", label: "Mean body-weight change", note: "Observed across structured metabolic research cohorts." },
  { metric: "GLP-1", label: "Triple-pathway engagement", note: "Studied across GLP-1, GIP, and glucagon receptor models." },
  { metric: "24w", label: "Longitudinal signal", note: "Controlled observations tracked appetite and glucose-related markers." },
  { metric: "99.1%", label: "Verified purity", note: "Each batch is assayed by HPLC with accompanying documentation." },
];

const ACE_TESTIMONIALS = [
  { quote: "The batch documentation is unusually complete, and the packaging arrives ready for protocol intake.", who: "DR. E. VALE", inst: "Metabolic Signaling Lab" },
  { quote: "Ace feels built for researchers who need clear chain-of-custody and quick lot comparison.", who: "M. CHEN", inst: "Endocrine Methods Group" },
  { quote: "The COA-first ordering flow saves time when we are screening compounds for repeat assays.", who: "A. RIVERA", inst: "Applied Peptide Bench" },
];

const ACE_LAB_STEPS = [
  { step: "01", name: "Solid-phase synthesis", detail: "Retatrutide sequence assembled under controlled conditions with lot-level reagent tracking." },
  { step: "02", name: "Cleavage and purification", detail: "Crude peptide is purified by preparative chromatography until the target HPLC threshold is met." },
  { step: "03", name: "Identity confirmation", detail: "LC-MS identity checks and chromatographic purity readings are reconciled before vialing." },
  { step: "04", name: "Lyophilization", detail: "Purified fractions are frozen, dried, and sealed as research-grade lyophilized powder." },
  { step: "05", name: "Cold-chain release", detail: "Released vials ship with COA, batch hash, cold-chain packaging, and tracker-pod records." },
];

const ACE_FAQS = [
  { q: "What is Retatrutide (LY3437943)?", a: "Retatrutide is a synthetic peptide studied in metabolic and endocrine research. It functions as a triple receptor agonist interacting with GLP-1, GIP, and glucagon receptors." },
  { q: "Is this product for human consumption?", a: "No. Ace Peptides products are intended strictly for laboratory research purposes only. Not for human or animal consumption and not for diagnostic or therapeutic use." },
  { q: "What documentation ships with each vial?", a: "Each lot includes a certificate of analysis with HPLC purity, identity testing, batch metadata, release date, and storage guidance." },
  { q: "Who can purchase?", a: "Products are available to qualified researchers, academic institutions, and licensed laboratories confirming legitimate research use." },
];

const ACE_RESIDUES = [
  "Tyr", "Aib", "Glu", "Gly", "Thr", "Phe", "Thr", "Ser", "Asp", "Tyr",
  "Ser", "Ile", "Aib", "Leu", "Asp", "Lys", "Gln", "Ala", "Ala", "Lys",
  "Glu", "Phe", "Val", "Gln", "Trp", "Leu", "Ile", "Ala", "Gly", "Gly",
  "Pro", "Ser", "Ser", "Gly", "Ala", "Pro", "Pro", "Pro", "Ser", "NH2",
];

const ACE_GLOBAL_CSS = String.raw`
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Cinzel:wght@400;600;700&display=swap');
  html, body, #root { min-height: 100%; background: #030303; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #F0EFE8; font-family: 'Inter', sans-serif; overflow-x: hidden; }
  ::selection { background: #D4AF37; color: #000; }
  button, input { border-radius: 0; }

  @keyframes ace-particle-rise { 0% { transform: translateY(0) translateX(0); opacity: 0; } 8% { opacity: .9; } 82% { opacity: .55; } 100% { transform: translateY(-105vh) translateX(16px); opacity: 0; } }
  @keyframes ace-dash { to { stroke-dashoffset: -160; } }
  @keyframes ace-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes ace-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: .2; } }
  @keyframes ace-sheen { 0% { left: -50%; opacity: 0; } 18% { opacity: .9; } 100% { left: 150%; opacity: 0; } }
  @keyframes ace-glow { 0%, 100% { filter: drop-shadow(0 0 8px rgba(212,175,55,.38)); } 50% { filter: drop-shadow(0 0 28px rgba(245,208,122,.86)); } }
  @keyframes ace-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes ace-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

  .ace-shimmer {
    background: linear-gradient(90deg, #9A7A1A, #F5D07A, #D4AF37, #F5D07A, #9A7A1A);
    background-size: 220% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ace-shimmer 5s linear infinite;
  }
  @keyframes ace-shimmer { 0% { background-position: -220% center; } 100% { background-position: 220% center; } }

  .ace-btn-gold, .ace-btn-outline {
    border-radius: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: .18em;
    text-transform: uppercase;
    font-weight: 700;
    cursor: pointer;
    transition: transform .2s, opacity .2s, background .25s, color .25s, border-color .25s;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
  }
  .ace-btn-gold {
    border: none;
    color: #000;
    background: linear-gradient(135deg, #9A7A1A 0%, #D4AF37 52%, #F5D07A 100%);
    padding: 12px 22px;
  }
  .ace-btn-gold:hover { opacity: .9; transform: translateY(-1px) scale(1.02); }
  .ace-btn-gold::after {
    content: '';
    position: absolute;
    top: 0;
    left: -80%;
    width: 48%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent);
    transform: skewX(-18deg);
  }
  .ace-btn-gold:hover::after { animation: ace-sheen .65s ease forwards; }
  .ace-btn-outline {
    background: transparent;
    border: 1px solid rgba(212,175,55,.58);
    color: #D4AF37;
    padding: 11px 22px;
  }
  .ace-btn-outline:hover { background: #D4AF37; color: #000; border-color: #D4AF37; transform: translateY(-1px); }

  .cin-nav { transition: color .25s, transform .25s; }
  .cin-nav:hover { color: #F5D07A !important; transform: translateY(-1px); }
  .ace-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .26em; color: #D4AF37; text-transform: uppercase; font-weight: 600; }
  .ace-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(212,175,55,.22), transparent); }
  .ace-chip-dot { width: 7px; height: 7px; display: inline-block; background: #D4AF37; box-shadow: 0 0 12px rgba(212,175,55,.9); }
  .ace-suit-marker { display: inline-flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; transition: transform .35s, box-shadow .35s; }
  .ace-section-anchor:hover .ace-suit-marker { transform: rotate(12deg) scale(1.06); box-shadow: 0 0 20px rgba(212,175,55,.18); }
  .ace-no-scrollbar { scrollbar-width: none; }
  .ace-no-scrollbar::-webkit-scrollbar { display: none; }

  .ace-placeholder-hatch {
    background:
      linear-gradient(135deg, rgba(212,175,55,.08) 25%, transparent 25%) 0 0/18px 18px,
      linear-gradient(315deg, rgba(212,175,55,.06) 25%, transparent 25%) 0 0/18px 18px,
      rgba(212,175,55,.02);
  }
  .ace-range { accent-color: #D4AF37; }
  .ace-range::-webkit-slider-runnable-track { height: 2px; background: rgba(212,175,55,.24); }
  .ace-range::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; margin-top: -6px; background: #D4AF37; border: 1px solid #F5D07A; box-shadow: 0 0 14px rgba(212,175,55,.7); }

  .ace-foil-host::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(115deg, transparent 0%, rgba(245,208,122,.08) 38%, rgba(255,255,255,.14) 50%, rgba(212,175,55,.06) 62%, transparent 100%);
    transform: translateX(-120%);
    opacity: 0;
  }
  .ace-foil-host:hover::after { animation: ace-foil 1.2s ease forwards; }
  @keyframes ace-foil { 0% { transform: translateX(-120%); opacity: 0; } 18% { opacity: 1; } 100% { transform: translateX(120%); opacity: 0; } }

  .ace-deal-host .ace-deal-ghost {
    position: absolute;
    inset: 16px;
    border: 1px solid rgba(212,175,55,.18);
    background: linear-gradient(160deg, #0E0E0E 0%, #050505 100%);
    z-index: -1;
    opacity: .7;
    transform: translate(12px, 12px) rotate(3deg);
    transition: transform .5s cubic-bezier(.2,.8,.2,1), opacity .4s;
  }
  .ace-deal-host .ace-deal-ghost-2 { transform: translate(24px, 24px) rotate(6deg); opacity: .45; }
  .ace-deal-host:hover .ace-deal-ghost { transform: translate(22px, 16px) rotate(6deg); opacity: .85; }
  .ace-deal-host:hover .ace-deal-ghost-2 { transform: translate(42px, 30px) rotate(11deg); opacity: .62; }

  @media (max-width: 1100px) {
    header { grid-template-columns: 1fr !important; gap: 18px; justify-items: center; }
    header nav { flex-wrap: wrap; justify-content: center; }
    section { padding-left: 24px !important; padding-right: 24px !important; }
    footer { flex-direction: column; gap: 12px; text-align: center; align-items: center; }
  }
  @media (max-width: 760px) {
    h2 { font-size: 42px !important; }
    section > div[style*='grid-template-columns'] { grid-template-columns: 1fr !important; }
  }
`;

// Shared primitives used by both Direction A and Direction B.
// Includes: particle field, ace logo mark, peptide-chain SVG animation,
// scan-line overlay, and helper hooks.

// ──────────────────────────────────────────────────────────────
// Particle field — luminous gold specks rising
// ──────────────────────────────────────────────────────────────
function AceParticles({ count = 60, density = 1, intensity = 1 }) {
  const particles = useMemo(() => {
    const N = Math.round(count * density);
    return Array.from({ length: N }).map((_, i) => ({
      id: i,
      size: 0.8 + Math.random() * 3,
      left: Math.random() * 100,
      delay: Math.random() * 16,
      dur: 8 + Math.random() * 12,
      hueDrift: (Math.random() - 0.5) * 6,
    }));
  }, [count, density]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
        opacity: intensity,
      }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,208,122,0.95), rgba(212,175,55,0.18), transparent)",
            animation: `ace-particle-rise ${p.dur}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Ace logo — drawn as SVG rather than relying on external asset.
// A minimal spade-in-diamond wordmark.
// ──────────────────────────────────────────────────────────────
function AceMark({ size = 48, glow = true, accent = "#D4AF37" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      style={{
        filter: glow
          ? `drop-shadow(0 0 8px ${accent}88)`
          : "none",
        display: "block",
      }}
    >
      <defs>
        <linearGradient id={`ace-grad-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5D07A" />
          <stop offset="50%" stopColor={accent} />
          <stop offset="100%" stopColor="#7A5D12" />
        </linearGradient>
      </defs>
      {/* Diamond outline */}
      <path
        d="M32 3 L61 32 L32 61 L3 32 Z"
        stroke={`url(#ace-grad-${size})`}
        strokeWidth="1.3"
        fill="none"
      />
      {/* Inner diamond */}
      <path
        d="M32 10 L54 32 L32 54 L10 32 Z"
        stroke={accent}
        strokeOpacity="0.28"
        strokeWidth="0.8"
        fill="none"
      />
      {/* Spade */}
      <path
        d="M32 19
           C 27 25, 21 29, 21 35
           C 21 39, 24 42, 28 42
           C 30 42, 31.3 41, 32 39.5
           C 32.7 41, 34 42, 36 42
           C 40 42, 43 39, 43 35
           C 43 29, 37 25, 32 19 Z
           M 30 42 L 28 47 L 36 47 L 34 42 Z"
        fill={`url(#ace-grad-${size})`}
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────
// Peptide chain viewer — interactive SVG backbone
// Draws a zigzag/helical-looking backbone with residue beads.
// Hovered residue is highlighted; reveals on scroll-into-view.
// ──────────────────────────────────────────────────────────────
function PeptideChain({
  residues = ACE_RESIDUES,
  width = 900,
  height = 280,
  animated = true,
  interactive = true,
  dense = true,
}) {
  const [hover, setHover] = useState(null);
  const n = residues.length;

  // Build a gentle sinusoidal zigzag
  const points = useMemo(() => {
    const marginX = 28;
    const marginY = 50;
    const stepX = (width - marginX * 2) / (n - 1);
    return residues.map((r, i) => {
      const x = marginX + stepX * i;
      // Alternating zig + soft wave
      const wave = Math.sin(i * 0.9) * 24;
      const zig = (i % 2 === 0 ? -1 : 1) * 36;
      const y = height / 2 + wave + zig;
      return { x, y, r, i };
    });
  }, [residues, width, height, n]);

  const path = useMemo(() => {
    if (!points.length) return "";
    return points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const midX = (prev.x + p.x) / 2;
      return `${acc} C ${midX} ${prev.y}, ${midX} ${p.y}, ${p.x} ${p.y}`;
    }, "");
  }, [points]);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="pc-stroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"  stopColor="#7A5D12" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="65%" stopColor="#F5D07A" />
          <stop offset="100%" stopColor="#7A5D12" />
        </linearGradient>
        <radialGradient id="pc-bead">
          <stop offset="0%" stopColor="#FFE8A8" />
          <stop offset="40%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#5A3F0A" />
        </radialGradient>
        <filter id="pc-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      {/* Dotted helix shadow below */}
      {dense && (
        <path
          d={path}
          fill="none"
          stroke="rgba(212,175,55,0.12)"
          strokeWidth="1"
          strokeDasharray="1 6"
          transform="translate(0, 14)"
        />
      )}

      {/* Main backbone glow */}
      <path
        d={path}
        fill="none"
        stroke="url(#pc-stroke)"
        strokeWidth="2.4"
        strokeLinecap="round"
        filter="url(#pc-glow)"
        opacity="0.55"
      />
      {/* Main backbone line */}
      <path
        d={path}
        fill="none"
        stroke="url(#pc-stroke)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray={animated ? "4 4" : "0"}
        style={animated ? { animation: "ace-dash 12s linear infinite" } : {}}
      />

      {/* Residue beads */}
      {points.map((p, i) => {
        const active = hover === i;
        const r = active ? 7 : 4.2;
        return (
          <g
            key={i}
            onMouseEnter={() => interactive && setHover(i)}
            onMouseLeave={() => interactive && setHover(null)}
            style={{ cursor: interactive ? "pointer" : "default" }}
          >
            {/* Ring */}
            <circle
              cx={p.x}
              cy={p.y}
              r={active ? 13 : 0}
              fill="none"
              stroke="rgba(212,175,55,0.45)"
              strokeWidth="1"
              style={{ transition: "r .2s" }}
            />
            {/* Bead */}
            <circle
              cx={p.x}
              cy={p.y}
              r={r}
              fill="url(#pc-bead)"
              stroke="#F5D07A"
              strokeOpacity={active ? 1 : 0.35}
              strokeWidth="0.8"
              style={{ transition: "r .2s" }}
            />
            {/* Label */}
            <text
              x={p.x}
              y={i % 2 === 0 ? p.y - 14 : p.y + 22}
              textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace"
              fontSize="8"
              fill={active ? "#F5D07A" : "rgba(200,198,184,0.45)"}
              style={{ transition: "fill .2s" }}
            >
              {p.r}
            </text>
          </g>
        );
      })}

      {/* Hover info callout */}
      {hover !== null && (
        <g>
          <line
            x1={points[hover].x}
            y1={points[hover].y}
            x2={points[hover].x}
            y2={20}
            stroke="rgba(212,175,55,0.3)"
            strokeWidth="0.6"
            strokeDasharray="2 3"
          />
          <text
            x={points[hover].x}
            y={14}
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="9"
            fill="#D4AF37"
            letterSpacing="1.5"
          >
            {`RES ${String(hover + 1).padStart(2, "0")} · ${points[hover].r.toUpperCase()}`}
          </text>
        </g>
      )}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────
// Scan-line HUD overlay (Direction A atmosphere)
// ──────────────────────────────────────────────────────────────
function ScanLines({ opacity = 0.04 }) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        background:
          `repeating-linear-gradient(0deg, rgba(212,175,55,${opacity}) 0 1px, transparent 1px 3px)`,
        mixBlendMode: "overlay",
      }}
    />
  );
}

// ──────────────────────────────────────────────────────────────
// Monospace ticker (batch numbers scrolling)
// ──────────────────────────────────────────────────────────────
function AceTicker({ items, speed = 40 }) {
  const content = [...items, ...items];
  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: "1px solid rgba(212,175,55,0.15)",
        borderBottom: "1px solid rgba(212,175,55,0.15)",
        padding: "10px 0",
        background: "rgba(212,175,55,0.02)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          gap: 44,
          whiteSpace: "nowrap",
          animation: `ace-ticker ${speed}s linear infinite`,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#8A8878",
        }}
      >
        {content.map((s, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#D4AF37" }}>◆</span> {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Typewriter text
// ──────────────────────────────────────────────────────────────
function Typewriter({ text, speed = 28, delay = 0 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const t0 = setTimeout(() => {
      const iv = setInterval(() => {
        setI((c) => {
          if (c >= text.length) { clearInterval(iv); return c; }
          return c + 1;
        });
      }, speed);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t0);
  }, [text, speed, delay]);

  return (
    <span>
      {text.slice(0, i)}
      <span style={{ animation: "ace-blink 1s step-end infinite" }}>▍</span>
    </span>
  );
}

// ──────────────────────────────────────────────────────────────
// Placeholder imagery block — stripy with a mono label
// ──────────────────────────────────────────────────────────────
function AcePlaceholder({ label = "product shot", height = 260, aspect }) {
  return (
    <div
      className="ace-placeholder-hatch"
      style={{
        width: "100%",
        height,
        aspectRatio: aspect,
        border: "1px solid rgba(212,175,55,0.15)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(212,175,55,0.45)",
        }}
      >
        [ {label} ]
      </span>
      {/* corner marks */}
      {["tl","tr","bl","br"].map((c) => (
        <span key={c} style={{
          position: "absolute",
          ...(c.includes("t") ? { top: 6 } : { bottom: 6 }),
          ...(c.includes("l") ? { left: 6 } : { right: 6 }),
          width: 10, height: 10,
          borderTop: c.includes("t") ? "1px solid rgba(212,175,55,0.45)" : "none",
          borderBottom: c.includes("b") ? "1px solid rgba(212,175,55,0.45)" : "none",
          borderLeft: c.includes("l") ? "1px solid rgba(212,175,55,0.45)" : "none",
          borderRight: c.includes("r") ? "1px solid rgba(212,175,55,0.45)" : "none",
        }} />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Cursor reticle — A-frame crosshair that follows cursor
// ──────────────────────────────────────────────────────────────
function AceCursor({ enabled = true, color = "#D4AF37" }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    if (!enabled) return;
    const move = (e) => { setPos({ x: e.clientX, y: e.clientY }); setHidden(false); };
    const leave = () => setHidden(true);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, [enabled]);
  if (!enabled) return null;
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: pos.x, top: pos.y,
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: hidden ? 0 : 1,
        transition: "opacity .2s",
        mixBlendMode: "difference",
      }}
    >
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="1" />
        <circle cx="18" cy="18" r="2" fill={color} />
        <line x1="18" y1="1" x2="18" y2="7" stroke={color} strokeWidth="1" />
        <line x1="18" y1="29" x2="18" y2="35" stroke={color} strokeWidth="1" />
        <line x1="1" y1="18" x2="7" y2="18" stroke={color} strokeWidth="1" />
        <line x1="29" y1="18" x2="35" y2="18" stroke={color} strokeWidth="1" />
      </svg>
    </div>
  );
}



// DIRECTION B — "Cinematic Ace"
// Theatrical card-reveal hero, larger display type, bolder
// ace-of-spades motif, parallax, dramatic dark + gold staging.

// Suit-symbol section anchor — rotates the suit on hover, used as an
// editorial chapter marker before each section title.
function SuitAnchor({ T, suit = "♠", label, sub }) {
  return (
    <div className="ace-section-anchor" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
      <span
        className="ace-suit-marker"
        style={{
          width: 36, height: 36,
          fontSize: 22,
          border: `1px solid ${T.gold3}66`,
          color: T.gold3,
        }}
      >
        {suit}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span className="ace-eyebrow">{label}</span>
        {sub && (
          <span style={{ fontFamily: T.fontDisplay, fontSize: 9, letterSpacing: "0.22em", color: T.ink3, textTransform: "uppercase" }}>
            · {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function DirectionB({ tweaks = {}, frameId = "b" }) {
  const T = ACE_TOKENS;
  const [section, setSection] = useState("home");
  const [cart, setCart] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);
  const [revealCard, setRevealCard] = useState(false);
  const [activeProduct, setActiveProduct] = useState(1);
  const [checkoutMethod, setCheckoutMethod] = useState("card");
  const [walletConnected, setWalletConnected] = useState(false);
  const [txStatus, setTxStatus] = useState(null);

  // Trigger card reveal after mount
  useEffect(() => {
    const t = setTimeout(() => setRevealCard(true), 320);
    return () => clearTimeout(t);
  }, []);

  const {
    particleDensity = 1.2,
    animations = 1,
    cursorReticle = true,
    lightMode = false,
  } = tweaks;

  const addToCart = (p) => {
    setCart((prev) => {
      const e = prev.find((i) => i.id === p.id);
      if (e) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const updateQty = (id, d) =>
    setCart((p) =>
      p.flatMap((i) => (i.id !== id ? [i] : i.qty + d < 1 ? [] : [{ ...i, qty: i.qty + d }]))
    );
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const bg = lightMode ? "#F4F3EC" : "#030303";
  const fg = lightMode ? "#1F1F1A" : T.ink0;
  const panel = lightMode ? "#FFFFFF" : "#0A0A0A";
  const subtle = lightMode ? "#6A6A60" : T.ink3;
  const faint = lightMode ? "#C8C6B8" : T.ink4;

  return (
    <div
      style={{
        background:
          lightMode ? bg :
          `radial-gradient(ellipse at top, #141008 0%, ${bg} 45%), ${bg}`,
        color: fg,
        fontFamily: T.fontBody,
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AceParticles count={80} density={particleDensity} intensity={animations * 0.9} />
      <AceCursor enabled={cursorReticle} color={T.gold4} />

      {/* Theatrical vignette + spotlight */}
      {!lightMode && (
        <>
          <div
            aria-hidden
            style={{
              position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
              background: "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08), transparent 55%)",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 95%)",
            }}
          />
        </>
      )}

      {/* ─── HEADER ──────────────────────── */}
      <header
        style={{
          position: "sticky", top: 0, zIndex: 50,
          display: "grid", gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "22px 48px",
          background: lightMode ? "rgba(244,243,236,0.9)" : "rgba(3,3,3,0.88)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${lightMode ? "rgba(0,0,0,0.08)" : "rgba(212,175,55,0.14)"}`,
        }}
      >
        <div onClick={() => setSection("home")} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
          <AceMark size={40} glow={!lightMode} accent={T.gold4} />
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 16, letterSpacing: "0.38em", fontWeight: 600 }}>ACE</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 8, letterSpacing: "0.4em", color: subtle, marginTop: 4 }}>
              PEPTIDES
            </div>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 22 }}>
          {[
            ["home", "Home", "♠"],
            ["products", "Compounds", "♦"],
            ["calc", "Calculator", "♣"],
            ["subscribe", "Subscribe", "♥"],
            ["viewer", "Chain", "♠"],
            ["research", "Research", "♦"],
            ["lab", "Lab", "♣"],
            ["coa", "COA", "♥"],
            ["faq", "FAQ", "♠"],
          ].map(([k, l, suit]) => (
            <button
              key={k}
              onClick={() => setSection(k)}
              className="cin-nav"
              style={{
                background: "transparent", border: "none",
                color: section === k ? T.gold4 : subtle,
                fontFamily: T.fontDisplay, fontSize: 11,
                letterSpacing: "0.22em", textTransform: "uppercase",
                cursor: "pointer", padding: "4px 0",
                position: "relative",
                fontWeight: 500,
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              <span style={{ fontFamily: T.fontSerif, fontSize: 9, color: section === k ? T.gold4 : T.gold3 + "88", opacity: section === k ? 1 : 0.5 }}>
                {suit}
              </span>
              {l}
              {section === k && (
                <span style={{
                  position: "absolute", bottom: -6, left: "50%",
                  width: 5, height: 5, borderRadius: "50%",
                  background: T.gold4, transform: "translateX(-50%)",
                  boxShadow: `0 0 10px ${T.gold4}`,
                }} />
              )}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => setSection("cart")}
            style={{
              position: "relative",
              background: "transparent",
              border: `1px solid ${T.gold3}66`,
              color: fg,
              fontFamily: T.fontDisplay,
              fontSize: 10,
              letterSpacing: "0.22em",
              padding: "10px 18px",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Hand ({String(totalItems).padStart(2, "0")})
          </button>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 2 }}>
        {section === "home" && <HomeB T={T} lightMode={lightMode} revealCard={revealCard} setSection={setSection} setActiveProduct={setActiveProduct} addToCart={addToCart} />}
        {section === "products" && <ProductsB T={T} lightMode={lightMode} activeProduct={activeProduct} setActiveProduct={setActiveProduct} addToCart={addToCart} />}
        {section === "calc" && <CalcB T={T} lightMode={lightMode} />}
        {section === "subscribe" && <SubscribeB T={T} lightMode={lightMode} addToCart={addToCart} setSection={setSection} />}
        {section === "viewer" && <ChainViewerB T={T} lightMode={lightMode} />}
        {section === "research" && <ResearchB T={T} lightMode={lightMode} />}
        {section === "lab" && <LabB T={T} lightMode={lightMode} />}
        {section === "coa" && <CoaB T={T} lightMode={lightMode} />}
        {section === "faq" && <FaqB T={T} lightMode={lightMode} openFaq={openFaq} setOpenFaq={setOpenFaq} />}
        {section === "cart" && (
          <CartB
            T={T} lightMode={lightMode} cart={cart} cartTotal={cartTotal}
            updateQty={updateQty} removeFromCart={removeFromCart}
            checkoutMethod={checkoutMethod} setCheckoutMethod={setCheckoutMethod}
            walletConnected={walletConnected} setWalletConnected={setWalletConnected}
            txStatus={txStatus} setTxStatus={setTxStatus}
            setSection={setSection}
          />
        )}
      </main>

      <div className="ace-divider" />
      <footer style={{ padding: "32px 48px", display: "flex", justifyContent: "space-between", fontFamily: T.fontDisplay, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: faint }}>
        <span>© 2026 Ace Peptides</span>
        <span>Precision · Performance · Superiority</span>
        <span>Terms · Privacy · Contact</span>
      </footer>
    </div>
  );
}

// ────────────────────────────────────────────────
// HOME — card-reveal hero
// ────────────────────────────────────────────────
function HomeB({ T, lightMode, revealCard, setSection, setActiveProduct, addToCart }) {
  const subtle = lightMode ? "#6A6A60" : T.ink3;
  const panel = lightMode ? "#FAF9F2" : "#0A0A0A";

  return (
    <>
      {/* HERO */}
      <section
        style={{
          position: "relative",
          minHeight: "82vh",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 48px",
          overflow: "hidden",
        }}
      >
        {/* Enormous A glyph behind */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "48%", left: "50%", transform: "translate(-50%,-50%)",
            fontFamily: T.fontSerif,
            fontSize: "68vh",
            lineHeight: 1,
            fontWeight: 700,
            color: "transparent",
            WebkitTextStroke: lightMode ? "1px rgba(0,0,0,0.08)" : "1px rgba(212,175,55,0.07)",
            pointerEvents: "none",
            userSelect: "none",
            letterSpacing: "-0.05em",
          }}
        >
          A
        </div>

        {/* Eyebrow */}
        <div style={{ position: "absolute", top: 48, left: 48, display: "flex", alignItems: "center", gap: 10, fontFamily: T.fontDisplay, fontSize: 10, letterSpacing: "0.3em", color: subtle, textTransform: "uppercase" }}>
          <span className="ace-chip-dot" style={{ animation: "ace-blink 1.3s step-end infinite" }} />
          Now Dealing · Retatrutide
        </div>

        {/* Card stage */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
          {/* Side wings */}
          <div style={{ width: 180, transform: "rotate(-12deg) translateY(20px)", opacity: revealCard ? 0.5 : 0, transition: "opacity 1.2s .4s" }}>
            <AceCard T={T} lightMode={lightMode} product={ACE_PRODUCTS[0]} compact />
          </div>

          <AceCardLarge T={T} lightMode={lightMode} reveal={revealCard} />

          <div style={{ width: 180, transform: "rotate(12deg) translateY(20px)", opacity: revealCard ? 0.5 : 0, transition: "opacity 1.2s .4s" }}>
            <AceCard T={T} lightMode={lightMode} product={ACE_PRODUCTS[2]} compact />
          </div>
        </div>

        {/* Bottom plate */}
        <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 48px" }}>
          <div style={{ maxWidth: 340, opacity: revealCard ? 1 : 0, transform: revealCard ? "translateY(0)" : "translateY(14px)", transition: "all 1s .8s" }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 10, color: T.gold3, letterSpacing: "0.26em", marginBottom: 8 }}>
              ◆ HOUSE OF ACE
            </div>
            <div style={{ fontSize: 14, color: subtle, lineHeight: 1.7 }}>
              A triple-receptor agonist of rare precision — dealt only to qualified research benches. Each vial ships with a signed certificate of analysis.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, opacity: revealCard ? 1 : 0, transform: revealCard ? "translateY(0)" : "translateY(14px)", transition: "all 1s 1s" }}>
            <button className="ace-btn-gold" onClick={() => setSection("products")}>View the Hand</button>
            <button className="ace-btn-outline" onClick={() => setSection("viewer")}>Inspect Chain</button>
          </div>

          <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: subtle, letterSpacing: "0.22em", textTransform: "uppercase", textAlign: "right", opacity: revealCard ? 1 : 0, transition: "opacity 1s 1.2s" }}>
            ◆ Lot RTT-260<br/>
            ≥99.1% HPLC<br/>
            Lyophilized · −20°C
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <AceTicker
        items={[
          "PRECISION",
          "PERFORMANCE",
          "SUPERIORITY",
          "HPLC ≥ 99.1%",
          "TRIPLE AGONIST",
          "LAB USE ONLY",
          "COA PER BATCH",
          "COLD CHAIN SHIPPING",
        ]}
        speed={50}
      />

      {/* Signature panel */}
      <section style={{ padding: "80px 48px", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <SuitAnchor T={T} suit="♠" label="SIGNATURE COMPOUND" sub="LY3437943" />
            <h2 style={{ fontFamily: T.fontSerif, fontSize: "clamp(48px,6vw,88px)", fontWeight: 600, lineHeight: 0.95, marginBottom: 20, letterSpacing: "0.02em" }}>
              <span className="ace-shimmer">Retatrutide</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: subtle, maxWidth: 460, marginBottom: 28 }}>
              Studied as a triple receptor agonist — GLP-1, GIP, and glucagon. Observed to modulate body-weight, appetite signaling, and glucose markers across controlled metabolic studies.
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <button className="ace-btn-gold" onClick={() => setSection("products")}>▸ Choose a Dose</button>
              <button className="ace-btn-outline" onClick={() => setSection("research")}>▸ The Research</button>
            </div>
          </div>

          {/* Peptide chain in elegant frame */}
          <div style={{ background: panel, border: "1px solid rgba(212,175,55,0.18)", padding: 28, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 10, letterSpacing: "0.24em", color: T.gold3 }}>
                ◆ LY3437943 · 40 RESIDUES
              </div>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 10, letterSpacing: "0.22em", color: subtle }}>
                C224H367N65O74
              </div>
            </div>
            <PeptideChain width={560} height={260} />
            <div style={{ marginTop: 12, textAlign: "center", fontFamily: T.fontDisplay, fontSize: 10, color: subtle, letterSpacing: "0.18em" }}>
              ▸ hover a residue to inspect
            </div>
          </div>
        </div>
      </section>

      {/* Findings mosaic */}
      <section style={{ padding: "40px 48px 120px" }}>
        <SuitAnchor T={T} suit="♥" label="OBSERVED IN STUDIES" sub="controlled cohorts" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {ACE_FINDINGS.map((f, i) => (
            <div
              key={i}
              style={{
                background: panel,
                border: "1px solid rgba(212,175,55,0.15)",
                padding: "32px 24px",
                position: "relative",
                overflow: "hidden",
                minHeight: 220,
              }}
            >
              <div style={{
                position: "absolute",
                top: -20, right: -10,
                fontFamily: T.fontSerif,
                fontSize: 120,
                color: "rgba(212,175,55,0.06)",
                fontWeight: 700,
                lineHeight: 1,
              }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: T.gold3, letterSpacing: "0.22em", marginBottom: 14 }}>
                OBS · {String(i + 1).padStart(2, "0")}
              </div>
              <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 36, fontWeight: 600, lineHeight: 1.1, marginBottom: 10 }}>
                {f.metric}
              </div>
              <div style={{ fontSize: 14, color: lightMode ? T.ink5 : T.ink0, fontWeight: 500, marginBottom: 4 }}>
                {f.label}
              </div>
              <div style={{ fontSize: 12, color: subtle, lineHeight: 1.6 }}>{f.note}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ────────────────────────────────────────────────
// Large ace card (hero centerpiece)
// ────────────────────────────────────────────────
function AceCardLarge({ T, lightMode, reveal }) {
  return (
    <div
      style={{
        position: "relative",
        width: 320,
        height: 460,
        perspective: 1800,
        zIndex: 5,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%", height: "100%",
          background: `linear-gradient(160deg, #0E0E0E 0%, #060606 100%)`,
          border: `1.5px solid ${T.gold3}88`,
          boxShadow: reveal
            ? `0 40px 100px rgba(0,0,0,0.9), 0 0 80px rgba(212,175,55,0.35), inset 0 0 0 1px rgba(212,175,55,0.15)`
            : "0 10px 40px rgba(0,0,0,0.8)",
          transformOrigin: "center",
          transform: reveal ? "rotateY(0) translateY(0) scale(1)" : "rotateY(180deg) translateY(30px) scale(0.92)",
          transition: "transform 1.4s cubic-bezier(.2,.8,.2,1), box-shadow 1.4s",
          display: "flex",
          flexDirection: "column",
          padding: 24,
          overflow: "hidden",
          backfaceVisibility: "hidden",
        }}
      >
        {/* sheen on reveal */}
        {reveal && (
          <div style={{
            position: "absolute", top: 0, width: "40%", height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
            animation: "ace-sheen 1.6s ease-out .6s",
          }} />
        )}

        {/* inner border */}
        <div style={{ position: "absolute", inset: 10, border: "1px solid rgba(212,175,55,0.12)" }} />

        {/* top pip */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
          <span style={{ fontFamily: T.fontSerif, fontSize: 28, color: T.gold3, fontWeight: 700 }}>A</span>
          <span style={{ color: T.gold3, fontSize: 22, marginTop: 2 }}>♠</span>
        </div>

        {/* center */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <div style={{ animation: reveal ? "ace-glow 3.5s ease-in-out infinite" : "none" }}>
            <AceMark size={140} accent={T.gold4} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 15, letterSpacing: "0.28em", color: T.ink0, marginBottom: 6 }}>
              ACE OF SPADES
            </div>
            <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 30, fontWeight: 600, letterSpacing: "0.05em" }}>
              Retatrutide
            </div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: T.ink3, letterSpacing: "0.26em", marginTop: 10 }}>
              LY3437943 · ≥99% HPLC
            </div>
          </div>
        </div>

        {/* bottom pip */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1, transform: "rotate(180deg)" }}>
          <span style={{ fontFamily: T.fontSerif, fontSize: 28, color: T.gold3, fontWeight: 700 }}>A</span>
          <span style={{ color: T.gold3, fontSize: 22, marginTop: 2 }}>♠</span>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Small ace card
// ────────────────────────────────────────────────
function AceCard({ T, lightMode, product, compact, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: compact ? 180 : 228,
        height: compact ? 260 : 320,
        background: `linear-gradient(160deg, #0C0C0C 0%, #040404 100%)`,
        border: `1px solid ${T.gold3}44`,
        boxShadow: `0 16px 50px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(212,175,55,0.08)`,
        padding: compact ? 14 : 18,
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ position: "absolute", inset: 7, border: "1px solid rgba(212,175,55,0.08)" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
        <span style={{ fontFamily: T.fontSerif, fontSize: compact ? 13 : 16, color: T.gold3, fontWeight: 700 }}>A</span>
        <span style={{ color: T.gold3, fontSize: compact ? 11 : 14, marginTop: 1 }}>♠</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <AceMark size={compact ? 48 : 64} />
        <div style={{ fontFamily: T.fontSerif, fontSize: compact ? 11 : 13, color: T.ink0, letterSpacing: "0.08em", marginTop: 6 }}>
          {product.name}
        </div>
        <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: compact ? 20 : 26, fontWeight: 600 }}>
          ${product.price.toFixed(0)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1, transform: "rotate(180deg)" }}>
        <span style={{ fontFamily: T.fontSerif, fontSize: compact ? 13 : 16, color: T.gold3, fontWeight: 700 }}>A</span>
        <span style={{ color: T.gold3, fontSize: compact ? 11 : 14, marginTop: 1 }}>♠</span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// PRODUCTS — horizontal scroll-snap, large editorial imagery
// ────────────────────────────────────────────────
function ProductsB({ T, lightMode, activeProduct, setActiveProduct, addToCart }) {
  const panel = lightMode ? "#FAF9F2" : "#0A0A0A";
  const subtle = lightMode ? "#6A6A60" : T.ink3;

  return (
    <section style={{ padding: "72px 0 120px" }}>
      <div style={{ padding: "0 48px", marginBottom: 38 }}>
        <SuitAnchor T={T} suit="♦" label="THE HAND" sub="three doses" />
        <h2 style={{ fontFamily: T.fontSerif, fontSize: 64, fontWeight: 600, marginTop: 8, letterSpacing: "0.02em" }}>
          Three Doses
        </h2>
        <p style={{ fontSize: 14, color: subtle, lineHeight: 1.7, maxWidth: 520, marginTop: 10 }}>
          Each compound synthesized in-house, assayed by HPLC and LC-MS, then sealed under inert atmosphere. <span style={{ color: T.gold3 }}>Hover any card</span> to deal it from the deck.
        </p>
      </div>

      <div
        className="ace-no-scrollbar"
        style={{
          display: "flex",
          gap: 60,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          padding: "12px 48px 80px",
        }}
      >
        {ACE_PRODUCTS.map((p, i) => {
          const isActive = activeProduct === p.id;
          return (
            <article
              key={p.id}
              onClick={() => setActiveProduct(p.id)}
              className="ace-deal-host ace-foil-host"
              style={{
                flex: `0 0 ${isActive ? 680 : 560}px`,
                scrollSnapAlign: "start",
                background: panel,
                border: `1px solid ${isActive ? T.gold3 + "99" : "rgba(212,175,55,0.2)"}`,
                boxShadow: isActive
                  ? "0 30px 80px rgba(0,0,0,0.7), 0 0 50px rgba(212,175,55,0.18)"
                  : "0 12px 40px rgba(0,0,0,0.5)",
                display: "grid",
                gridTemplateRows: "360px 1fr",
                position: "relative",
                overflow: "visible",
                transition: "flex .6s cubic-bezier(.2,.8,.2,1), box-shadow .5s, border-color .4s",
                cursor: "pointer",
              }}
            >
              {/* Ghost cards that "deal out" on hover */}
              <div className="ace-deal-ghost" aria-hidden />
              <div className="ace-deal-ghost ace-deal-ghost-2" aria-hidden />
              {/* Dramatic imagery */}
              <div
                style={{
                  position: "relative",
                  background: `radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.18), transparent 60%), linear-gradient(180deg, #0f0f0f, #050505)`,
                  borderBottom: "1px solid rgba(212,175,55,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* Large A backdrop */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    fontFamily: T.fontSerif,
                    fontSize: 420,
                    color: "transparent",
                    WebkitTextStroke: "1px rgba(212,175,55,0.12)",
                    lineHeight: 1,
                    fontWeight: 700,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  A
                </div>

                {/* Central vial w/ halo */}
                <div style={{ position: "relative", animation: "ace-float 7s ease-in-out infinite" }}>
                  {/* Halo */}
                  <div style={{
                    position: "absolute", inset: -60,
                    background: "radial-gradient(circle, rgba(212,175,55,0.25), transparent 60%)",
                    filter: "blur(20px)",
                  }} />
                  {/* Vial */}
                  <div style={{ position: "relative", width: 110, height: 270 }}>
                    <div style={{
                      position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                      width: 66, height: 34,
                      background: `linear-gradient(180deg, ${T.gold4}, ${T.gold2} 60%, ${T.gold1})`,
                      borderRadius: "8px 8px 2px 2px",
                      boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.45), 0 4px 14px rgba(212,175,55,0.4)",
                    }} />
                    <div style={{
                      position: "absolute", top: 32, left: "50%", transform: "translateX(-50%)",
                      width: 90, height: 230,
                      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(212,175,55,0.1))",
                      border: "1px solid rgba(212,175,55,0.55)",
                      borderRadius: "3px 3px 12px 12px",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        position: "absolute", bottom: 0, left: 5, right: 5,
                        height: `${36 + p.mg * 2}%`,
                        background: `linear-gradient(180deg, rgba(245,208,122,0.25), rgba(212,175,55,0.55))`,
                        boxShadow: "inset 0 6px 14px rgba(245,208,122,0.4)",
                      }} />
                      <div style={{
                        position: "absolute", top: "38%", left: -2, right: -2, height: 62,
                        background: "#060606",
                        border: `1px solid ${T.gold3}55`,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ fontFamily: T.fontSerif, fontSize: 11, color: T.gold3, letterSpacing: "0.3em", fontWeight: 600 }}>
                          ACE
                        </div>
                        <div style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 700, color: T.ink0 }}>
                          {p.mg}mg
                        </div>
                        <div style={{ fontFamily: T.fontDisplay, fontSize: 7, color: subtle, letterSpacing: "0.2em" }}>
                          RTT-260
                        </div>
                      </div>
                      <div style={{
                        position: "absolute", top: 12, left: 12, width: 10, height: "70%",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.45), transparent)",
                        borderRadius: 5,
                      }} />
                    </div>
                  </div>
                </div>

                {/* Dose tag */}
                <span style={{
                  position: "absolute", top: 18, left: 18,
                  fontFamily: T.fontDisplay, fontSize: 10, color: T.gold3,
                  letterSpacing: "0.28em", padding: "5px 12px",
                  border: "1px solid rgba(212,175,55,0.4)",
                }}>
                  {String(i + 1).padStart(2, "0")} / {ACE_PRODUCTS.length}
                </span>

                <span style={{
                  position: "absolute", top: 18, right: 18,
                  fontFamily: T.fontSerif, fontSize: 20, color: T.gold3, fontWeight: 700,
                }}>
                  ♠
                </span>
              </div>

              {/* Info */}
              <div style={{ padding: "28px 32px 30px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 600, letterSpacing: "0.02em" }}>
                      {p.name}
                    </div>
                    <div style={{ fontFamily: T.fontDisplay, fontSize: 10, color: subtle, letterSpacing: "0.2em", marginTop: 6 }}>
                      CAS {p.cas} · BATCH {p.batch}
                    </div>
                  </div>
                  <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 36, fontWeight: 700 }}>
                    ${p.price.toFixed(2)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 18, fontFamily: T.fontDisplay, fontSize: 10, letterSpacing: "0.16em", color: subtle, textTransform: "uppercase" }}>
                  <span>◆ {p.purity} purity</span>
                  <span>◆ {p.form}</span>
                  <span>◆ yield {p.yield}</span>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button
                    className="ace-btn-gold"
                    style={{ flex: 1, padding: 14 }}
                    onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                  >
                    ▸ Add to Hand
                  </button>
                  <button className="ace-btn-outline" style={{ padding: "14px 20px" }}>
                    ◆ Spec Sheet
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ padding: "0 48px", fontFamily: T.fontDisplay, fontSize: 10, letterSpacing: "0.24em", color: subtle, textTransform: "uppercase" }}>
        ◂ scroll · snap to dose ▸
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────
// CHAIN VIEWER
// ────────────────────────────────────────────────
function ChainViewerB({ T, lightMode }) {
  const panel = lightMode ? "#FAF9F2" : "#0A0A0A";
  const subtle = lightMode ? "#6A6A60" : T.ink3;

  return (
    <section style={{ padding: "72px 48px 120px" }}>
      <SuitAnchor T={T} suit="♣" label="THE CHAIN" sub="40 residues" />
      <h2 style={{ fontFamily: T.fontSerif, fontSize: 64, fontWeight: 600, marginTop: 8, marginBottom: 30, letterSpacing: "0.02em" }}>
        Residue by Residue
      </h2>

      <div style={{ background: panel, border: "1px solid rgba(212,175,55,0.2)", padding: 40, position: "relative" }}>
        <div style={{ position: "absolute", inset: 10, border: "1px solid rgba(212,175,55,0.08)", pointerEvents: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 11, color: T.gold3, letterSpacing: "0.26em" }}>◆ LY3437943</div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 11, color: subtle, letterSpacing: "0.24em" }}>40 RESIDUES · 4962.41 Da</div>
        </div>

        <PeptideChain width={1000} height={320} />

        <div style={{ marginTop: 24, fontFamily: T.fontDisplay, fontSize: 10, color: subtle, letterSpacing: "0.22em", textAlign: "center" }}>
          ▸ hover any residue to reveal
        </div>
      </div>

      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
        {[
          ["N-Terminus", "Tyr – Aib", "residues 1-2"],
          ["GLP-1 domain", "Ala-Asp-Lys", "affinity α"],
          ["GIP domain", "Phe-Val-Gln", "affinity β"],
          ["C-Terminus", "Pro-Ser-NH₂", "residues 38-40"],
        ].map(([k, v, n]) => (
          <div key={k} style={{ background: panel, border: "1px solid rgba(212,175,55,0.15)", padding: "22px 20px" }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: T.gold3, letterSpacing: "0.22em" }}>{k.toUpperCase()}</div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 22, marginTop: 8, marginBottom: 4 }}>{v}</div>
            <div style={{ fontSize: 11, color: subtle }}>{n}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────
// RESEARCH
// ────────────────────────────────────────────────
function ResearchB({ T, lightMode }) {
  const panel = lightMode ? "#FAF9F2" : "#0A0A0A";
  const subtle = lightMode ? "#6A6A60" : T.ink3;

  return (
    <section style={{ padding: "72px 48px 120px" }}>
      <SuitAnchor T={T} suit="♥" label="THE RESEARCH" sub="observed effects" />
      <h2 style={{ fontFamily: T.fontSerif, fontSize: 64, fontWeight: 600, marginTop: 8, marginBottom: 30, letterSpacing: "0.02em" }}>
        Observed in the Field
      </h2>

      <p style={{ fontSize: 15, color: subtle, lineHeight: 1.8, maxWidth: 700, marginBottom: 50 }}>
        Retatrutide is a synthetic peptide studied in metabolic and endocrine research — a triple receptor agonist engaging GLP-1, GIP, and glucagon. In controlled settings, activation of these pathways has been associated with changes in appetite-related signaling, metabolic activity, and glucose-related markers.
      </p>

      {/* Findings editorial */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 70 }}>
        {ACE_FINDINGS.map((f, i) => (
          <div key={i} style={{ background: panel, border: "1px solid rgba(212,175,55,0.15)", padding: "36px 32px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 10, color: T.gold3, letterSpacing: "0.24em", marginBottom: 12 }}>
              OBS · {String(i + 1).padStart(2, "0")}
            </div>
            <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 56, fontWeight: 700, lineHeight: 1, marginBottom: 14 }}>
              {f.metric}
            </div>
            <div style={{ fontSize: 17, color: lightMode ? T.ink5 : T.ink0, fontWeight: 500, marginBottom: 6 }}>{f.label}</div>
            <div style={{ fontSize: 13, color: subtle }}>{f.note}</div>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <SuitAnchor T={T} suit="♠" label="FROM THE FIELD" sub="researcher voices" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {ACE_TESTIMONIALS.map((t, i) => (
          <div key={i} style={{ background: panel, border: "1px solid rgba(212,175,55,0.15)", padding: "32px 28px", position: "relative" }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 54, color: T.gold3, lineHeight: 0.6, marginBottom: 16 }}>"</div>
            <p style={{ fontFamily: T.fontSerif, fontSize: 17, lineHeight: 1.6, color: lightMode ? T.ink5 : T.ink0, marginBottom: 24, fontStyle: "italic" }}>
              {t.quote}
            </p>
            <div className="ace-divider" style={{ marginBottom: 14 }} />
            <div style={{ fontFamily: T.fontDisplay, fontSize: 11, color: T.gold3, letterSpacing: "0.14em" }}>{t.who}</div>
            <div style={{ fontSize: 11, color: subtle, marginTop: 4 }}>{t.inst}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────
// LAB
// ────────────────────────────────────────────────
function LabB({ T, lightMode }) {
  const panel = lightMode ? "#FAF9F2" : "#0A0A0A";
  const subtle = lightMode ? "#6A6A60" : T.ink3;

  return (
    <section style={{ padding: "72px 48px 120px" }}>
      <SuitAnchor T={T} suit="♣" label="BEHIND THE HAND" sub="the lab process" />
      <h2 style={{ fontFamily: T.fontSerif, fontSize: 64, fontWeight: 600, marginTop: 8, marginBottom: 40, letterSpacing: "0.02em" }}>
        From Resin to Vial
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {ACE_LAB_STEPS.map((s, i) => (
          <div
            key={s.step}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 280px",
              gap: 40,
              alignItems: "center",
              padding: "36px 32px",
              background: panel,
              border: "1px solid rgba(212,175,55,0.12)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 72, fontWeight: 700, lineHeight: 1 }}>
              {s.step}
            </div>
            <div>
              <div style={{ fontFamily: T.fontSerif, fontSize: 26, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 8 }}>
                {s.name}
              </div>
              <div style={{ fontSize: 14, color: subtle, lineHeight: 1.75, maxWidth: 520 }}>
                {s.detail}
              </div>
            </div>
            <AcePlaceholder label={`step ${s.step} · lab`} height={140} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────
// COA
// ────────────────────────────────────────────────
function CoaB({ T, lightMode }) {
  const panel = lightMode ? "#FAF9F2" : "#0A0A0A";
  const subtle = lightMode ? "#6A6A60" : T.ink3;
  const [activeBatch, setActiveBatch] = useState(1);
  const p = ACE_PRODUCTS.find((x) => x.id === activeBatch);

  return (
    <section style={{ padding: "72px 48px 120px" }}>
      <SuitAnchor T={T} suit="♦" label="CERTIFICATE OF ANALYSIS" sub="per batch" />
      <h2 style={{ fontFamily: T.fontSerif, fontSize: 64, fontWeight: 600, marginTop: 8, marginBottom: 30, letterSpacing: "0.02em" }}>
        COA · <span className="ace-shimmer">{p.batch}</span>
      </h2>

      <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
        {ACE_PRODUCTS.map((x) => (
          <button
            key={x.id}
            onClick={() => setActiveBatch(x.id)}
            style={{
              background: activeBatch === x.id ? T.gold3 : "transparent",
              color: activeBatch === x.id ? "#000" : subtle,
              border: `1px solid ${activeBatch === x.id ? T.gold3 : "rgba(212,175,55,0.2)"}`,
              padding: "11px 22px",
              fontFamily: T.fontDisplay, fontSize: 10,
              letterSpacing: "0.22em", textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {x.batch} · {x.mg}mg
          </button>
        ))}
      </div>

      <div style={{ background: panel, border: "1px solid rgba(212,175,55,0.22)", padding: 48, position: "relative" }}>
        <div style={{ position: "absolute", inset: 14, border: "1px solid rgba(212,175,55,0.1)", pointerEvents: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 10, color: T.gold3, letterSpacing: "0.28em" }}>ACE_PEPTIDES · LAB AX-0042</div>
            <h3 style={{ fontFamily: T.fontSerif, fontSize: 34, fontWeight: 600, marginTop: 10, letterSpacing: "0.02em" }}>
              Certificate of Analysis
            </h3>
          </div>
          <AceMark size={64} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid rgba(212,175,55,0.18)", marginBottom: 36 }}>
          {[
            ["COMPOUND", "Retatrutide"],
            ["CAS", p.cas],
            ["BATCH", p.batch],
            ["ISSUED", "04.23.2026"],
            ["DOSE", `${p.mg}mg`],
            ["FORM", "Lyophilized"],
            ["STORAGE", "−20°C"],
            ["COA HASH", "0x8f3a…e1b2"],
          ].map(([k, v], i) => (
            <div
              key={k}
              style={{
                padding: "16px 18px",
                borderRight: (i + 1) % 4 !== 0 ? "1px solid rgba(212,175,55,0.08)" : "none",
                borderBottom: i < 4 ? "1px solid rgba(212,175,55,0.08)" : "none",
              }}
            >
              <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: subtle, letterSpacing: "0.22em" }}>{k}</div>
              <div style={{ fontFamily: T.fontSerif, fontSize: 16, marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="ace-eyebrow" style={{ marginBottom: 14 }}>▸ ASSAY RESULTS</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.fontDisplay, fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.gold3}66` }}>
              {["TEST", "METHOD", "SPEC", "RESULT", "STATUS"].map((h, i) => (
                <th key={h} style={{ textAlign: i >= 3 ? "right" : "left", padding: "12px 0", fontSize: 10, color: subtle, letterSpacing: "0.22em", fontWeight: 500 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Purity",          "RP-HPLC (UV 220nm)", "≥ 99.0%",     p.purity,      "PASS"],
              ["Identity",        "LC-MS",              "[M+H]+",      "4963.4 m/z",  "PASS"],
              ["Moisture",        "Karl Fischer",       "≤ 5.0%",      "2.7%",        "PASS"],
              ["Endotoxin",       "LAL",                "≤ 0.5 EU/mg", "<0.2 EU/mg",  "PASS"],
              ["Appearance",      "Visual",             "White powder","Conforms",    "PASS"],
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px dashed rgba(212,175,55,0.1)" }}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    style={{
                      padding: "14px 0",
                      color: j === 4 ? T.green : lightMode ? T.ink5 : T.ink1,
                      textAlign: j >= 3 ? "right" : "left",
                      fontWeight: j === 4 ? 700 : 400,
                      letterSpacing: j === 4 ? "0.18em" : "normal",
                    }}
                  >
                    {j === 4 ? `◉ ${cell}` : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: `1px solid ${T.gold3}66` }}>
          <div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: subtle, letterSpacing: "0.24em" }}>QA RELEASED BY</div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 18, marginTop: 6, color: T.gold3, fontWeight: 600 }}>
              Dr. S. Mercier
            </div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: subtle, letterSpacing: "0.2em", marginTop: 2 }}>QA LEAD</div>
          </div>
          <button className="ace-btn-gold">▸ Download COA</button>
        </div>
      </div>

      {/* Shipping */}
      <div style={{ marginTop: 56 }}>
        <SuitAnchor T={T} suit="♣" label="SHIPPING & COMPLIANCE" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          {[
            ["COLD CHAIN", "Packed with gel packs, <8°C in transit. Tracker pod in every box."],
            ["FULFILLMENT", "Orders released within 24h. Overnight US, 2-3 day INTL express."],
            ["LICENSING", "Research-use certification auto-verified via ORCID or institutional lookup."],
          ].map(([k, v]) => (
            <div key={k} style={{ background: panel, border: "1px solid rgba(212,175,55,0.15)", padding: 28 }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 10, color: T.gold3, letterSpacing: "0.24em" }}>▸ {k}</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: subtle, marginTop: 14 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────
// FAQ
// ────────────────────────────────────────────────
function FaqB({ T, lightMode, openFaq, setOpenFaq }) {
  const subtle = lightMode ? "#6A6A60" : T.ink3;

  return (
    <section style={{ padding: "72px 48px 120px", maxWidth: 980, margin: "0 auto" }}>
      <SuitAnchor T={T} suit="♥" label="SUPPORT" sub="frequently asked" />
      <h2 style={{ fontFamily: T.fontSerif, fontSize: 64, fontWeight: 600, marginTop: 8, marginBottom: 40, letterSpacing: "0.02em" }}>
        Frequently Asked
      </h2>

      {ACE_FAQS.map((f, i) => (
        <div key={i} style={{ borderBottom: "1px solid rgba(212,175,55,0.14)" }}>
          <div
            onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "26px 0", cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <span style={{ fontFamily: T.fontSerif, fontSize: 16, color: T.gold3, fontWeight: 600, width: 40 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 500 }}>{f.q}</span>
            </div>
            <span style={{
              fontFamily: T.fontSerif, fontSize: 26, color: T.gold3,
              transform: openFaq === i ? "rotate(45deg)" : "none",
              transition: "transform .3s",
            }}>+</span>
          </div>
          {openFaq === i && (
            <div style={{ paddingBottom: 26, paddingLeft: 60, fontSize: 15, color: subtle, lineHeight: 1.85, maxWidth: 720, animation: "ace-fade-up .3s ease both" }}>
              {f.a}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

// ────────────────────────────────────────────────
// CART
// ────────────────────────────────────────────────
function CartB({
  T, lightMode, cart, cartTotal, updateQty, removeFromCart,
  checkoutMethod, setCheckoutMethod, walletConnected, setWalletConnected,
  txStatus, setTxStatus, setSection,
}) {
  const panel = lightMode ? "#FAF9F2" : "#0A0A0A";
  const subtle = lightMode ? "#6A6A60" : T.ink3;
  const [cardNum, setCardNum] = useState("4242 4242 4242 4242");
  const [cardExp, setCardExp] = useState("04/29");
  const [cardCvc, setCardCvc] = useState("123");

  const fakePay = () => {
    setTxStatus("processing");
    setTimeout(() => setTxStatus("success"), 1600);
  };

  return (
    <section style={{ padding: "72px 48px 120px", maxWidth: 1160, margin: "0 auto" }}>
      <SuitAnchor T={T} suit="♠" label="THE HAND" sub="your order" />
      <h2 style={{ fontFamily: T.fontSerif, fontSize: 64, fontWeight: 600, marginTop: 8, marginBottom: 40, letterSpacing: "0.02em" }}>
        Your Order
      </h2>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px 0", background: panel, border: "1px solid rgba(212,175,55,0.15)" }}>
          <AceMark size={72} />
          <div style={{ fontFamily: T.fontSerif, fontSize: 22, marginTop: 24, color: subtle, letterSpacing: "0.06em" }}>
            An empty hand
          </div>
          <button className="ace-btn-outline" style={{ marginTop: 28 }} onClick={() => setSection("products")}>
            ▸ Browse Compounds
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 28 }}>
          <div>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr auto",
                  gap: 20,
                  alignItems: "center",
                  padding: "22px 26px",
                  background: panel,
                  border: "1px solid rgba(212,175,55,0.15)",
                  marginBottom: 2,
                }}
              >
                <div style={{
                  width: 72, height: 72,
                  background: `radial-gradient(ellipse, rgba(212,175,55,0.22), transparent)`,
                  border: `1px solid ${T.gold3}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: T.fontSerif, fontSize: 18, color: T.gold3, fontWeight: 700,
                }}>
                  ♠
                </div>
                <div>
                  <div style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: 10, color: subtle, letterSpacing: "0.2em", marginTop: 4 }}>
                    BATCH {item.batch} · ${item.price.toFixed(2)} ea
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
                    <button onClick={() => updateQty(item.id, -1)} style={qtyBtnB(T)}>−</button>
                    <span style={{ fontFamily: T.fontDisplay, fontSize: 14, minWidth: 24, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={qtyBtnB(T)}>+</button>
                    <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 10, background: "none", border: "none", color: T.red, fontFamily: T.fontDisplay, fontSize: 10, letterSpacing: "0.22em", cursor: "pointer" }}>
                      × FOLD
                    </button>
                  </div>
                </div>
                <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 26, fontWeight: 700 }}>
                  ${(item.price * item.qty).toFixed(2)}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "26px 0", borderTop: `1px solid ${T.gold3}88`, marginTop: 8 }}>
              <div>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 10, color: subtle, letterSpacing: "0.22em" }}>TOTAL</div>
                <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 48, fontWeight: 700, marginTop: 6, lineHeight: 1 }}>
                  ${cartTotal.toFixed(2)}
                </div>
              </div>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 10, color: subtle, letterSpacing: "0.22em", textAlign: "right" }}>
                USD · FREE<br />COLD-CHAIN SHIPPING
              </div>
            </div>
          </div>

          <div style={{ background: panel, border: "1px solid rgba(212,175,55,0.22)", padding: 32, position: "relative" }}>
            <div style={{ position: "absolute", inset: 10, border: "1px solid rgba(212,175,55,0.08)", pointerEvents: "none" }} />

            <div className="ace-eyebrow" style={{ marginBottom: 18 }}>▸ PAYMENT</div>

            <div style={{ display: "flex", gap: 2, marginBottom: 24 }}>
              {[
                ["card",   "⬢ Card"],
                ["crypto", "◆ Crypto"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setCheckoutMethod(k)}
                  style={{
                    flex: 1,
                    background: checkoutMethod === k ? T.gold3 : "transparent",
                    color: checkoutMethod === k ? "#000" : subtle,
                    border: `1px solid ${checkoutMethod === k ? T.gold3 : "rgba(212,175,55,0.25)"}`,
                    padding: "12px 14px",
                    fontFamily: T.fontDisplay,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            {txStatus === "success" ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 54, color: T.green, marginBottom: 14 }}>◉</div>
                <div style={{ fontFamily: T.fontSerif, fontSize: 22, color: T.green, fontWeight: 600 }}>Payment Confirmed</div>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 10, color: subtle, marginTop: 10, letterSpacing: "0.16em" }}>
                  REF · 0x9a41e7b3…f0d2
                </div>
                <div style={{ fontSize: 13, color: subtle, marginTop: 20, lineHeight: 1.7 }}>
                  COA and tracking link will arrive within 2h.<br />Thank you for ordering from Ace.
                </div>
              </div>
            ) : checkoutMethod === "card" ? (
              <>
                <div style={{
                  background: `linear-gradient(135deg, ${T.gold1} 0%, ${T.gold3} 55%, ${T.gold4} 100%)`,
                  color: "#000", padding: 24, marginBottom: 20,
                  position: "relative", overflow: "hidden", aspectRatio: "1.65",
                  boxShadow: "0 20px 50px rgba(212,175,55,0.22)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontFamily: T.fontSerif, fontWeight: 700, letterSpacing: "0.3em", fontSize: 14 }}>ACE</div>
                      <div style={{ fontFamily: T.fontDisplay, fontSize: 9, letterSpacing: "0.22em", marginTop: 2 }}>RESEARCH CARD</div>
                    </div>
                    <span style={{ fontFamily: T.fontSerif, fontSize: 24, fontWeight: 700 }}>♠</span>
                  </div>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: 20, letterSpacing: "0.14em", marginTop: 42, fontWeight: 600 }}>
                    {cardNum.replace(/(\d{4})/g, "$1 ").trim()}
                  </div>
                  <div style={{ display: "flex", gap: 34, marginTop: 14, fontFamily: T.fontDisplay, fontSize: 12 }}>
                    <div>
                      <div style={{ fontSize: 8, letterSpacing: "0.22em", opacity: 0.6 }}>EXP</div>
                      <div style={{ fontWeight: 600 }}>{cardExp}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 8, letterSpacing: "0.22em", opacity: 0.6 }}>CVC</div>
                      <div style={{ fontWeight: 600 }}>•••</div>
                    </div>
                  </div>
                  <div style={{
                    position: "absolute", top: 0, width: "40%", height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                    animation: "ace-sheen 4s linear infinite",
                  }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <CardInputB T={T} lightMode={lightMode} label="CARD NUMBER" value={cardNum} onChange={setCardNum} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <CardInputB T={T} lightMode={lightMode} label="EXP" value={cardExp} onChange={setCardExp} />
                    <CardInputB T={T} lightMode={lightMode} label="CVC" value={cardCvc} onChange={setCardCvc} />
                  </div>
                </div>

                <button
                  className="ace-btn-gold"
                  style={{ width: "100%", padding: 18, marginTop: 20 }}
                  disabled={txStatus === "processing"}
                  onClick={fakePay}
                >
                  {txStatus === "processing" ? "◌ PROCESSING…" : `▸ Pay $${cartTotal.toFixed(2)}`}
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 14, color: subtle, lineHeight: 1.7, marginBottom: 20 }}>
                  Settle in ETH, direct wallet-to-wallet. Conversion happens at live rate at the moment of signing.
                </div>
                {!walletConnected ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button className="ace-btn-gold" style={{ width: "100%", padding: 16 }} onClick={() => setWalletConnected("coinbase")}>
                      ▸ Coinbase Wallet
                    </button>
                    <button className="ace-btn-outline" style={{ width: "100%", padding: 16 }} onClick={() => setWalletConnected("metamask")}>
                      ▸ MetaMask
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ padding: 16, border: "1px dashed rgba(212,175,55,0.3)", marginBottom: 16 }}>
                      <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: T.gold3, letterSpacing: "0.26em" }}>CONNECTED</div>
                      <div style={{ fontFamily: T.fontDisplay, fontSize: 12, marginTop: 8, wordBreak: "break-all", color: lightMode ? T.ink5 : T.ink1 }}>
                        0x74e9af21c6060328371b3813689b472132f89cbd
                      </div>
                    </div>
                    <button className="ace-btn-gold" style={{ width: "100%", padding: 18 }} disabled={txStatus === "processing"} onClick={fakePay}>
                      {txStatus === "processing" ? "◌ AWAITING SIGNATURE…" : `▸ Pay ${(cartTotal / 3400).toFixed(5)} ETH`}
                    </button>
                  </>
                )}
              </>
            )}

            <div style={{ marginTop: 20, fontFamily: T.fontDisplay, fontSize: 9, color: subtle, letterSpacing: "0.2em", textAlign: "center" }}>
              ◆ 256-BIT SSL · RESEARCH-USE ONLY
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function qtyBtnB(T) {
  return {
    width: 28, height: 28,
    background: "transparent",
    border: `1px solid ${T.gold3}55`,
    color: T.gold3,
    fontFamily: T.fontDisplay,
    fontSize: 14,
    cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  };
}

function CardInputB({ T, lightMode, label, value, onChange }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontFamily: T.fontDisplay, fontSize: 9, letterSpacing: "0.24em", color: T.gold3, display: "block", marginBottom: 6 }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: "transparent",
          border: "1px solid rgba(212,175,55,0.25)",
          color: lightMode ? T.ink5 : T.ink0,
          padding: "12px 14px",
          fontFamily: T.fontDisplay,
          fontSize: 14,
          letterSpacing: "0.14em",
          outline: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = T.gold3)}
        onBlur={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.25)")}
      />
    </label>
  );
}

// ────────────────────────────────────────────────
// CALCULATOR — dosing calculator with animated syringe
// ────────────────────────────────────────────────
function CalcB({ T, lightMode }) {
  const panel = lightMode ? "#FAF9F2" : "#0A0A0A";
  const subtle = lightMode ? "#6A6A60" : T.ink3;

  const [vialMg, setVialMg] = useState(10);          // mg of peptide in vial
  const [bacWaterMl, setBacWaterMl] = useState(2);   // ml of bac water added
  const [targetMcg, setTargetMcg] = useState(500);   // mcg per dose
  const [syringeUnits, setSyringeUnits] = useState(100); // 100u = 1ml insulin syringe

  // mg/ml in the reconstituted vial
  const concMgPerMl = vialMg / bacWaterMl;
  // ml needed for target dose
  const mlPerDose = (targetMcg / 1000) / concMgPerMl;
  // syringe units (units = ml * 100 for insulin syringe by convention)
  const unitsPerDose = mlPerDose * 100;
  const totalDoses = Math.floor(vialMg / (targetMcg / 1000));

  // Position of fill in syringe SVG
  const fillPct = Math.min(100, Math.max(0, (unitsPerDose / syringeUnits) * 100));

  return (
    <section style={{ padding: "72px 48px 120px" }}>
      <SuitAnchor T={T} suit="♣" label="THE DEAL" sub="dosing calculator" />
      <h2 style={{ fontFamily: T.fontSerif, fontSize: 64, fontWeight: 600, marginTop: 8, marginBottom: 14, letterSpacing: "0.02em" }}>
        Reconstitution & Dosing
      </h2>
      <p style={{ fontSize: 14, color: subtle, lineHeight: 1.7, maxWidth: 640, marginBottom: 40 }}>
        For research planning. Enter your vial mass, the volume of bacteriostatic water you'll add, and your target dose. We'll compute the draw on a standard insulin syringe.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 32, alignItems: "start" }}>
        {/* INPUTS */}
        <div style={{ background: panel, border: "1px solid rgba(212,175,55,0.22)", padding: 36, position: "relative" }}>
          <div style={{ position: "absolute", inset: 12, border: "1px solid rgba(212,175,55,0.08)", pointerEvents: "none" }} />

          {/* Vial mg */}
          <CalcRow T={T} label="VIAL MASS" suffix="mg" subtle={subtle}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[5, 10, 15].map((v) => (
                <button
                  key={v}
                  onClick={() => setVialMg(v)}
                  style={pillStyleB(T, vialMg === v)}
                >
                  ♠ {v}mg
                </button>
              ))}
            </div>
          </CalcRow>

          {/* Bac water */}
          <CalcRow T={T} label="BACTERIOSTATIC WATER" suffix="ml" subtle={subtle}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="range"
                min={0.5} max={5} step={0.25}
                value={bacWaterMl}
                onChange={(e) => setBacWaterMl(parseFloat(e.target.value))}
                className="ace-range"
                style={{ flex: 1 }}
              />
              <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 700, minWidth: 80, textAlign: "right" }}>
                {bacWaterMl.toFixed(2)} <span style={{ fontFamily: T.fontDisplay, fontSize: 11, color: subtle, letterSpacing: "0.16em" }}>ML</span>
              </div>
            </div>
          </CalcRow>

          {/* Target dose */}
          <CalcRow T={T} label="TARGET DOSE" suffix="mcg" subtle={subtle}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="range"
                min={100} max={3000} step={50}
                value={targetMcg}
                onChange={(e) => setTargetMcg(parseInt(e.target.value, 10))}
                className="ace-range"
                style={{ flex: 1 }}
              />
              <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 700, minWidth: 110, textAlign: "right" }}>
                {targetMcg} <span style={{ fontFamily: T.fontDisplay, fontSize: 11, color: subtle, letterSpacing: "0.16em" }}>MCG</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              {[250, 500, 1000, 2000].map((v) => (
                <button key={v} onClick={() => setTargetMcg(v)} style={pillStyleB(T, targetMcg === v, true)}>
                  {v}
                </button>
              ))}
            </div>
          </CalcRow>

          {/* Syringe size */}
          <CalcRow T={T} label="SYRINGE" suffix="units" subtle={subtle} last>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                [50, "0.5ml · 50u"],
                [100, "1.0ml · 100u"],
              ].map(([v, l]) => (
                <button key={v} onClick={() => setSyringeUnits(v)} style={pillStyleB(T, syringeUnits === v)}>
                  ♣ {l}
                </button>
              ))}
            </div>
          </CalcRow>

          {/* Concentration readout */}
          <div style={{ marginTop: 28, padding: "20px 0", borderTop: `1px solid ${T.gold3}66`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 9, letterSpacing: "0.24em", color: subtle }}>RECONSTITUTED CONCENTRATION</div>
              <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 34, fontWeight: 700, marginTop: 4 }}>
                {concMgPerMl.toFixed(2)} mg/ml
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 9, letterSpacing: "0.24em", color: subtle }}>DOSES PER VIAL</div>
              <div style={{ fontFamily: T.fontSerif, fontSize: 34, fontWeight: 700, marginTop: 4, color: T.gold3 }}>
                ≈ {totalDoses}
              </div>
            </div>
          </div>
        </div>

        {/* OUTPUT — syringe visual */}
        <div style={{ background: panel, border: "1px solid rgba(212,175,55,0.22)", padding: 36, position: "relative" }}>
          <div style={{ position: "absolute", inset: 12, border: "1px solid rgba(212,175,55,0.08)", pointerEvents: "none" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <div className="ace-eyebrow">♦ DRAW</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 9, letterSpacing: "0.22em", color: subtle }}>
              {syringeUnits === 50 ? "U-50" : "U-100"} INSULIN
            </div>
          </div>

          {/* Big number */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 96, fontWeight: 700, lineHeight: 1, letterSpacing: "0.02em" }}>
              {unitsPerDose.toFixed(1)}
            </div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 11, letterSpacing: "0.3em", color: T.gold3, marginTop: 4 }}>
              ◆ UNITS · {mlPerDose.toFixed(3)} ML
            </div>
          </div>

          {/* Syringe SVG */}
          <Syringe T={T} fillPct={fillPct} maxUnits={syringeUnits} />

          {/* Compliance note */}
          <div style={{ marginTop: 24, padding: 16, border: "1px dashed rgba(212,175,55,0.25)", fontSize: 11, color: subtle, lineHeight: 1.7 }}>
            ◆ Calculation provided for research planning only. Verify dose with your protocol. Not for human use. Store reconstituted vials at 2–8°C; use within 28 days.
          </div>
        </div>
      </div>

      {/* Quick-cards: dose schedule */}
      <div style={{ marginTop: 56 }}>
        <SuitAnchor T={T} suit="♠" label="SCHEDULE PREVIEW" sub="based on your inputs" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginTop: 12 }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const doseN = i + 1;
            const remainingMg = vialMg - (doseN * (targetMcg / 1000));
            const ok = remainingMg > -0.01;
            return (
              <div key={i} style={{
                background: panel,
                border: `1px solid ${ok ? T.gold3 + "44" : T.ink4}`,
                padding: "16px 14px",
                opacity: ok ? 1 : 0.35,
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 9, letterSpacing: "0.24em", color: T.gold3 }}>
                  ♣ DAY {String(doseN).padStart(2, "0")}
                </div>
                <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 700, marginTop: 6 }}>
                  {unitsPerDose.toFixed(1)}u
                </div>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: subtle, letterSpacing: "0.16em", marginTop: 4 }}>
                  {Math.max(0, remainingMg).toFixed(2)}MG LEFT
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CalcRow({ T, label, suffix, subtle, children, last }) {
  return (
    <div style={{ paddingBottom: last ? 0 : 22, marginBottom: last ? 0 : 22, borderBottom: last ? "none" : "1px dashed rgba(212,175,55,0.12)" }}>
      <div style={{ fontFamily: T.fontDisplay, fontSize: 9, letterSpacing: "0.26em", color: T.gold3, marginBottom: 12 }}>
        ▸ {label} <span style={{ color: subtle, fontWeight: 400 }}>· {suffix}</span>
      </div>
      {children}
    </div>
  );
}

function pillStyleB(T, active, mini) {
  return {
    background: active ? T.gold3 : "transparent",
    color: active ? "#000" : T.gold3,
    border: `1px solid ${active ? T.gold3 : "rgba(212,175,55,0.3)"}`,
    padding: mini ? "7px 12px" : "10px 16px",
    fontFamily: T.fontDisplay,
    fontSize: mini ? 10 : 11,
    letterSpacing: "0.18em",
    cursor: "pointer",
    textTransform: "uppercase",
    fontWeight: 600,
    transition: "all .25s",
  };
}

function Syringe({ T, fillPct, maxUnits }) {
  const ticks = maxUnits === 50 ? 10 : 20; // 5u or 5u increments
  const inc = maxUnits / ticks;
  return (
    <div style={{ position: "relative", padding: "28px 12px 14px", margin: "0 auto", width: "100%" }}>
      <svg viewBox="0 0 720 120" width="100%" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="syr-fill" x1="0" x2="1">
            <stop offset="0%" stopColor={T.gold4} stopOpacity="0.55" />
            <stop offset="100%" stopColor={T.gold3} stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="syr-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.06)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>
        </defs>

        {/* Needle */}
        <line x1="0" y1="60" x2="60" y2="60" stroke={T.gold3} strokeWidth="2" />
        <line x1="60" y1="58" x2="78" y2="58" stroke={T.gold3} strokeWidth="6" />
        {/* Barrel */}
        <rect x="78" y="40" width="540" height="40" fill="url(#syr-glass)" stroke={T.gold3} strokeWidth="1.5" />
        {/* Liquid */}
        <rect x="78" y="42" width={540 * (fillPct / 100)} height="36" fill="url(#syr-fill)" />
        {/* Plunger track */}
        <rect x={78 + 540 * (fillPct / 100)} y="40" width={540 - 540 * (fillPct / 100)} height="40" fill="rgba(212,175,55,0.04)" />
        {/* Plunger */}
        <rect x={70 + 540 * (fillPct / 100)} y="35" width="14" height="50" fill={T.gold3} stroke={T.gold4} />
        <rect x={84 + 540 * (fillPct / 100)} y="42" width="80" height="36" fill="none" stroke={T.gold3 + "55"} strokeDasharray="3 3" />
        <rect x={164 + 540 * (fillPct / 100)} y="32" width="36" height="56" fill={T.ink4} stroke={T.gold3} />

        {/* Tick marks */}
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const x = 78 + (540 * i) / ticks;
          const big = i % 2 === 0;
          return (
            <g key={i}>
              <line x1={x} y1={40} x2={x} y2={big ? 30 : 34} stroke={T.gold3 + "aa"} strokeWidth={big ? 1.5 : 1} />
              {big && (
                <text x={x} y={22} fill={T.ink2} fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" letterSpacing="0.12em">
                  {Math.round(i * inc)}
                </text>
              )}
            </g>
          );
        })}

        {/* Marker showing draw position */}
        <g>
          <line
            x1={78 + 540 * (fillPct / 100)}
            y1="92"
            x2={78 + 540 * (fillPct / 100)}
            y2="108"
            stroke={T.gold4}
            strokeWidth="2"
          />
          <polygon
            points={`${78 + 540 * (fillPct / 100) - 5},108 ${78 + 540 * (fillPct / 100) + 5},108 ${78 + 540 * (fillPct / 100)},100`}
            fill={T.gold4}
          />
        </g>
      </svg>
    </div>
  );
}

// ────────────────────────────────────────────────
// SUBSCRIBE — auto-reorder with deck-of-cards visual
// ────────────────────────────────────────────────
function SubscribeB({ T, lightMode, addToCart, setSection }) {
  const panel = lightMode ? "#FAF9F2" : "#0A0A0A";
  const subtle = lightMode ? "#6A6A60" : T.ink3;

  const [cadence, setCadence] = useState(8); // weeks between deliveries
  const [tier, setTier] = useState(1); // product index
  const [hand, setHand] = useState([1]); // selected product ids

  const product = ACE_PRODUCTS.find((p) => p.id === tier);

  // Discount tiers: 4w=15%, 6w=12%, 8w=10%, 12w=6%
  const discountFor = (weeks) =>
    weeks <= 4 ? 0.15 : weeks <= 6 ? 0.12 : weeks <= 8 ? 0.10 : 0.06;
  const discount = discountFor(cadence);

  const handTotal = hand.reduce((s, id) => {
    const p = ACE_PRODUCTS.find((x) => x.id === id);
    return s + (p ? p.price : 0);
  }, 0);
  const subTotal = handTotal * (1 - discount);
  const annualSavings = (handTotal * discount) * (52 / cadence);

  const toggleHand = (id) =>
    setHand((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));

  // Build upcoming shipment dates
  const today = new Date(2026, 3, 28); // Apr 28, 2026
  const shipments = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + cadence * 7 * i);
    return d;
  });

  return (
    <section style={{ padding: "72px 48px 120px" }}>
      <SuitAnchor T={T} suit="♥" label="THE STANDING ORDER" sub="auto-reorder" />
      <h2 style={{ fontFamily: T.fontSerif, fontSize: 64, fontWeight: 600, marginTop: 8, marginBottom: 14, letterSpacing: "0.02em" }}>
        Keep the Deck Stocked
      </h2>
      <p style={{ fontSize: 14, color: subtle, lineHeight: 1.7, maxWidth: 640, marginBottom: 40 }}>
        Recurring shipment with COA, cold-chain, and tracker pod. Skip, swap, or cancel any time. The longer the cadence, the higher the loyalty discount.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 32, alignItems: "start" }}>
        {/* CONFIG */}
        <div style={{ background: panel, border: "1px solid rgba(212,175,55,0.22)", padding: 36, position: "relative" }}>
          <div style={{ position: "absolute", inset: 12, border: "1px solid rgba(212,175,55,0.08)", pointerEvents: "none" }} />

          {/* Cadence */}
          <CalcRow T={T} label="CADENCE" suffix="weeks between drops" subtle={subtle}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {[
                [4, "4 wk", "15%"],
                [6, "6 wk", "12%"],
                [8, "8 wk", "10%"],
                [12, "12 wk", "6%"],
              ].map(([w, l, d]) => (
                <button
                  key={w}
                  onClick={() => setCadence(w)}
                  style={{
                    background: cadence === w ? T.gold3 : "transparent",
                    color: cadence === w ? "#000" : subtle,
                    border: `1px solid ${cadence === w ? T.gold3 : "rgba(212,175,55,0.22)"}`,
                    padding: "16px 10px",
                    fontFamily: T.fontDisplay,
                    fontSize: 12,
                    letterSpacing: "0.16em",
                    cursor: "pointer",
                    fontWeight: 600,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    transition: "all .25s",
                  }}
                >
                  <span style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 700 }}>{l}</span>
                  <span style={{ fontSize: 9, opacity: 0.85 }}>♥ {d} OFF</span>
                </button>
              ))}
            </div>
          </CalcRow>

          {/* Compound */}
          <CalcRow T={T} label="DEFAULT COMPOUND" suffix="swap any time" subtle={subtle}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {ACE_PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTier(p.id)}
                  style={{
                    background: tier === p.id ? T.gold3 : "transparent",
                    color: tier === p.id ? "#000" : T.ink0,
                    border: `1px solid ${tier === p.id ? T.gold3 : "rgba(212,175,55,0.22)"}`,
                    padding: "14px 12px",
                    fontFamily: T.fontDisplay,
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    cursor: "pointer",
                    fontWeight: 600,
                    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
                    textAlign: "left",
                    transition: "all .25s",
                  }}
                >
                  <span style={{ fontSize: 9, opacity: 0.7 }}>♠ RTT-260</span>
                  <span style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 700 }}>{p.mg}mg</span>
                  <span style={{ fontSize: 9, letterSpacing: "0.18em" }}>${p.price.toFixed(0)}/VIAL</span>
                </button>
              ))}
            </div>
          </CalcRow>

          {/* Add-on hand */}
          <CalcRow T={T} label="ADD TO HAND" suffix="optional bundles" subtle={subtle} last>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {ACE_PRODUCTS.map((p) => {
                const on = hand.includes(p.id);
                return (
                  <label
                    key={p.id}
                    onClick={() => toggleHand(p.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "32px 1fr auto",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      background: on ? "rgba(212,175,55,0.08)" : "transparent",
                      border: `1px solid ${on ? T.gold3 + "66" : "rgba(212,175,55,0.14)"}`,
                      cursor: "pointer",
                      transition: "all .2s",
                    }}
                  >
                    <span style={{
                      width: 18, height: 18,
                      border: `1px solid ${T.gold3}`,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontFamily: T.fontSerif, fontSize: 12,
                      color: on ? "#000" : "transparent",
                      background: on ? T.gold3 : "transparent",
                    }}>
                      {on ? "♠" : ""}
                    </span>
                    <span style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 500 }}>
                      {p.name}
                    </span>
                    <span style={{ fontFamily: T.fontDisplay, fontSize: 12, color: T.gold3, letterSpacing: "0.14em" }}>
                      ${p.price.toFixed(0)}
                    </span>
                  </label>
                );
              })}
            </div>
          </CalcRow>
        </div>

        {/* PREVIEW — deck of recurring cards */}
        <div style={{ background: panel, border: "1px solid rgba(212,175,55,0.22)", padding: 36, position: "relative" }}>
          <div style={{ position: "absolute", inset: 12, border: "1px solid rgba(212,175,55,0.08)", pointerEvents: "none" }} />

          <div className="ace-eyebrow" style={{ marginBottom: 18 }}>♥ YOUR DECK</div>

          {/* Stacked cards visual */}
          <div style={{ position: "relative", height: 200, marginBottom: 24 }}>
            {shipments.map((d, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: i * 64,
                  top: i * 6,
                  width: 130,
                  height: 180,
                  background: `linear-gradient(160deg, #0E0E0E 0%, #050505 100%)`,
                  border: `1px solid ${i === 0 ? T.gold3 : T.gold3 + "55"}`,
                  boxShadow: `0 ${10 + i * 4}px ${20 + i * 6}px rgba(0,0,0,0.6)`,
                  padding: 10,
                  display: "flex", flexDirection: "column",
                  zIndex: 5 - i,
                  transition: "transform .35s",
                }}
                className={i === 0 ? "ace-foil-host" : ""}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.fontSerif, fontSize: 11, color: T.gold3, fontWeight: 700 }}>
                  <span>A</span>
                  <span style={{ fontSize: 11 }}>♥</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontFamily: T.fontSerif, fontSize: 26, fontWeight: 700, color: T.gold3 }}>♥</div>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: T.ink2, letterSpacing: "0.18em", marginTop: 6 }}>
                    DROP {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                    {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.fontSerif, fontSize: 11, color: T.gold3, fontWeight: 700, transform: "rotate(180deg)" }}>
                  <span>A</span>
                  <span>♥</span>
                </div>
              </div>
            ))}
          </div>

          {/* Schedule list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 22 }}>
            {shipments.map((d, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "26px 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: "12px 14px",
                background: i === 0 ? "rgba(212,175,55,0.06)" : "transparent",
                borderLeft: `2px solid ${i === 0 ? T.gold3 : T.gold3 + "22"}`,
              }}>
                <span style={{ fontFamily: T.fontDisplay, fontSize: 10, letterSpacing: "0.22em", color: T.gold3 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 500 }}>
                    {d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                  </div>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: subtle, letterSpacing: "0.2em", marginTop: 2 }}>
                    ♣ {product.name.toUpperCase()} {hand.length > 0 && hand[0] !== tier && `+ ${hand.length} ADD-ON`}
                  </div>
                </div>
                <span style={{ fontFamily: T.fontDisplay, fontSize: 11, color: i === 0 ? T.gold4 : subtle, letterSpacing: "0.18em" }}>
                  {i === 0 ? "FIRST DROP" : `+${i * cadence}W`}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div style={{ paddingTop: 18, borderTop: `1px solid ${T.gold3}66` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: T.fontDisplay, fontSize: 11, color: subtle, letterSpacing: "0.16em" }}>
              <span>HAND TOTAL</span>
              <span>${handTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontFamily: T.fontDisplay, fontSize: 11, color: T.gold3, letterSpacing: "0.16em" }}>
              <span>− LOYALTY {(discount * 100).toFixed(0)}%</span>
              <span>−${(handTotal * discount).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 9, letterSpacing: "0.24em", color: subtle }}>PER DROP</div>
                <div className="ace-shimmer" style={{ fontFamily: T.fontSerif, fontSize: 38, fontWeight: 700, lineHeight: 1, marginTop: 4 }}>
                  ${subTotal.toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 9, letterSpacing: "0.24em", color: subtle }}>SAVES / YEAR</div>
                <div style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 600, color: T.green, marginTop: 4 }}>
                  ${annualSavings.toFixed(0)}
                </div>
              </div>
            </div>

            <button
              className="ace-btn-gold"
              style={{ width: "100%", padding: 16, marginTop: 22 }}
              onClick={() => { hand.forEach((id) => addToCart(ACE_PRODUCTS.find((p) => p.id === id))); setSection("cart"); }}
            >
              ▸ Set the Standing Order
            </button>
            <div style={{ marginTop: 12, fontFamily: T.fontDisplay, fontSize: 9, color: subtle, letterSpacing: "0.2em", textAlign: "center" }}>
              ◆ SKIP · SWAP · CANCEL · ANY TIME
            </div>
          </div>
        </div>
      </div>

      {/* Member perks */}
      <div style={{ marginTop: 56 }}>
        <SuitAnchor T={T} suit="♣" label="STANDING ORDER PERKS" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, marginTop: 8 }}>
          {[
            ["♠ HOUSE PRIORITY", "Standing orders ship before walk-up orders."],
            ["♥ FIRST DEAL", "First access to new compounds before public release."],
            ["♦ DOUBLE COA", "Independent third-party retest at no cost, every 4th drop."],
            ["♣ FREE COLD-CHAIN", "Always overnight, always tracker-pod, always free."],
          ].map(([k, v]) => (
            <div key={k} style={{ background: panel, border: "1px solid rgba(212,175,55,0.15)", padding: 24 }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 10, color: T.gold3, letterSpacing: "0.22em" }}>{k}</div>
              <div style={{ fontSize: 13, color: subtle, lineHeight: 1.7, marginTop: 12 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



function GlobalStyles() {
  return <style>{ACE_GLOBAL_CSS}</style>;
}

export default function App() {
  if (process.env.REACT_APP_KILL_SWITCH === "true") {
    return (
      <div style={{ minHeight: "100vh", background: "#030303", color: ACE_TOKENS.ink0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, fontFamily: ACE_TOKENS.fontDisplay }}>
        <GlobalStyles />
        <AceMark size={72} accent={ACE_TOKENS.gold4} />
        <div style={{ fontFamily: ACE_TOKENS.fontSerif, fontSize: 28, letterSpacing: "0.24em" }}>ACE PEPTIDES</div>
        <div style={{ fontSize: 11, letterSpacing: "0.22em", color: ACE_TOKENS.ink3, textTransform: "uppercase" }}>Temporarily Unavailable</div>
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <DirectionB tweaks={{ particleDensity: 1.2, animations: 1, cursorReticle: true, lightMode: false }} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
