export default function ResearchSection({ researchFindings }) {
  return (
    <div className="section-animate">
      <div className="eyebrow">Science</div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 400, letterSpacing: "0.05em", marginBottom: 40 }}>
        Retatrutide Overview
      </h2>

      <div className="research-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 72, alignItems: "start" }}>
        {/* Body text */}
        <div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.95 }}>
            Retatrutide (LY3437943) is a synthetic peptide studied in metabolic and endocrine research. It functions as a triple receptor agonist, interacting with GLP-1, GIP, and glucagon receptors involved in energy balance and glucose regulation.
          </p>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.95 }}>
            In controlled research settings, activation of these pathways has been associated with effects on appetite signaling, metabolic activity, and glucose-related markers. Retatrutide continues to be studied for its role in metabolic research.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { label: "Receptor Targets", value: "3", sub: "GLP-1 · GIP · Glucagon" },
            { label: "Purity",           value: "≥99.1%", sub: "HPLC Verified" },
            { label: "CAS Number",       value: "LY3437943", sub: "2381089-83-2" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-sans)", marginBottom: 8 }}>
                {stat.label}
              </div>
              <div className="gold-text" style={{ fontFamily: "var(--font-serif)", fontSize: 22, marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.08em", fontFamily: "var(--font-sans)" }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="eyebrow" style={{ marginBottom: 14 }}>Published Findings</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {researchFindings.map((finding, i) => (
          <div key={i} className="finding-row">
            <span style={{ color: "var(--gold)", fontSize: 14, flexShrink: 0 }}>◈</span>
            <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.01em", lineHeight: 1.5 }}>{finding}</span>
          </div>
        ))}
      </div>

      <div className="disclaimer">
        <strong>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only.
        Not for human or animal consumption. Not for use in diagnostic or therapeutic applications.
      </div>

      <style>{`
        .stat-card {
          padding: 22px 24px;
          background: var(--surface);
          border: 1px solid var(--border);
          transition: border-color 0.3s;
        }
        .stat-card:hover { border-color: var(--border-hover); }
        .finding-row {
          padding: 22px 28px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 20px;
          transition: border-color 0.3s, transform 0.25s, background 0.25s;
        }
        .finding-row:hover {
          border-color: var(--border-hover);
          transform: translateX(6px);
          background: rgba(212,175,55,0.02);
        }
        @media (max-width: 720px) {
          .research-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
        }
      `}</style>
    </div>
  );
}
