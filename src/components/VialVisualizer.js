export default function VialVisualizer({ diluentMl, volumePerDose, doseMg }) {
  const VIAL_MAX = 5;
  const fillPct = Math.max(0, Math.min(1, diluentMl / VIAL_MAX));
  const doseFracOfFluid = diluentMl > 0 ? Math.max(0, Math.min(1, volumePerDose / diluentMl)) : 0;
  const glassTop = 30, glassBottom = 210;
  const glassH = glassBottom - glassTop;
  const liquidH = fillPct * glassH;
  const liquidY = glassBottom - liquidH;
  const doseY  = glassBottom - doseFracOfFluid * liquidH;
  const showDose = diluentMl > 0 && volumePerDose > 0;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, marginTop: 56 }}>
      <svg width="80" height="220" viewBox="0 0 80 220" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="vial-liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(245,208,122,0.18)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0.42)" />
          </linearGradient>
          <clipPath id="vial-clip">
            <rect x="14" y={glassTop - 2} width="52" height={glassH + 4} />
          </clipPath>
        </defs>
        <rect x="24" y="2" width="32" height="18" fill="#1E1E18" />
        <rect x="20" y="18" width="40" height="10" fill="#141410" />
        <rect x="14" y={glassTop - 2} width="52" height={glassH + 4}
          fill="rgba(212,175,55,0.02)" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
        <rect
          x="15" y={liquidY} width="50" height={liquidH}
          fill="url(#vial-liquid)" clipPath="url(#vial-clip)"
          style={{ transition: "y 0.6s ease, height 0.6s ease" }}
        />
        <line x1="20" y1={glassTop + 2} x2="20" y2={glassBottom - 6}
          stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
        {showDose && (
          <g style={{ transition: "transform 0.6s ease" }}>
            <line x1="4" y1={doseY} x2="76" y2={doseY}
              stroke="#F5D07A" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="14" cy={doseY} r="2.5" fill="#F5D07A" />
            <circle cx="66" cy={doseY} r="2.5" fill="#F5D07A" />
          </g>
        )}
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 170 }}>
        {showDose ? (
          <>
            <div style={{ fontSize: 9, color: "#D4AF37", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
              ◈ {doseMg}mg dose
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--text)" }}>
              {volumePerDose.toFixed(3)} mL
            </div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.04em", lineHeight: 1.7, fontFamily: "var(--font-sans)" }}>
              {(volumePerDose * 100).toFixed(0)} units on U-100<br />
              {(diluentMl / volumePerDose).toFixed(1)} doses per vial
            </div>
          </>
        ) : (
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>
            Enter values to visualize
          </div>
        )}
      </div>
    </div>
  );
}
