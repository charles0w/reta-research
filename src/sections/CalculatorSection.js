import VialVisualizer from "../components/VialVisualizer";

export default function CalculatorSection({
  vialMg, setVialMg,
  diluentMl, setDiluentMl,
  doseMg, setDoseMg,
  syringeMl, setSyringeMl,
}) {
  const concentration  = vialMg > 0 && diluentMl > 0 ? vialMg / diluentMl : 0;
  const volumePerDose  = concentration > 0 ? doseMg / concentration : 0;
  const unitsOnSyringe = volumePerDose * 100;
  const dosesPerVial   = doseMg > 0 ? vialMg / doseMg : 0;
  const exceedsSyringe = volumePerDose > syringeMl;
  const calcReady      = vialMg > 0 && diluentMl > 0 && doseMg > 0;

  return (
    <div className="section-animate" style={{ maxWidth: 740, margin: "0 auto" }}>
      <div className="eyebrow">Tools</div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 400, letterSpacing: "0.05em", marginBottom: 16 }}>
        Reconstitution Calculator
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: 520, marginBottom: 56 }}>
        Calculate units on a U-100 insulin syringe for a target research dose. For laboratory research only — not for human use.
      </p>

      {/* Input grid */}
      <div className="calc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          <label className="calc-label">Vial size (mg)</label>
          <input
            className="calc-input" type="number" min="0" step="0.5"
            value={vialMg}
            onChange={(e) => setVialMg(parseFloat(e.target.value) || 0)}
          />
          <div className="calc-helper">Total peptide in vial (lyophilized).</div>
        </div>

        <div>
          <label className="calc-label">Diluent volume (mL)</label>
          <input
            className="calc-input" type="number" min="0" step="0.1"
            value={diluentMl}
            onChange={(e) => setDiluentMl(parseFloat(e.target.value) || 0)}
          />
          <div className="calc-helper">Bacteriostatic water added.</div>
        </div>

        <div>
          <label className="calc-label">Target dose (mg)</label>
          <input
            className="calc-input" type="number" min="0" step="0.1"
            value={doseMg}
            onChange={(e) => setDoseMg(parseFloat(e.target.value) || 0)}
          />
          <div className="calc-helper">Dose per administration.</div>
        </div>

        <div>
          <label className="calc-label">Syringe type</label>
          <div className="seg-group" style={{ marginTop: 4 }}>
            {[[1, "1mL"], [0.5, "0.5mL"], [0.3, "0.3mL"]].map(([v, l]) => (
              <button
                key={v} type="button"
                className={`seg-btn ${syringeMl === v ? "active" : ""}`}
                onClick={() => setSyringeMl(v)}
              >
                U-100 {l}
              </button>
            ))}
          </div>
          <div className="calc-helper">Insulin syringe capacity.</div>
        </div>
      </div>

      {/* Results */}
      <div className="result-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginTop: 48, background: "var(--surface)", border: "1px solid var(--border)" }}>
        {[
          { label: "Concentration",  value: calcReady ? `${concentration.toFixed(2)} mg/mL` : "—", large: false, error: false },
          { label: "Volume per dose", value: calcReady ? `${volumePerDose.toFixed(3)} mL` : "—",   large: false, error: false },
          {
            label: "Units on syringe",
            value: calcReady ? `${unitsOnSyringe.toFixed(0)} units` : "—",
            large: true,
            error: exceedsSyringe && calcReady,
            errorMsg: "Exceeds syringe capacity",
          },
        ].map(({ label, value, large, error, errorMsg }) => (
          <div key={label} style={{ padding: "28px 24px", borderRight: "1px solid var(--border)" }}>
            <div style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10, fontFamily: "var(--font-sans)" }}>
              {label}
            </div>
            <div
              className={calcReady && !error ? "gold-text" : ""}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: large ? 28 : 22,
                fontWeight: large ? 600 : 400,
                color: !calcReady ? "var(--text-muted)" : error ? "#B04040" : undefined,
              }}
            >
              {value}
            </div>
            {error && calcReady && (
              <div style={{ fontSize: 10, color: "#B04040", marginTop: 8, lineHeight: 1.5 }}>{errorMsg}</div>
            )}
          </div>
        ))}
      </div>

      {calcReady && (
        <div style={{ marginTop: 18, fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.02em", lineHeight: 1.7 }}>
          Yields approximately{" "}
          <span style={{ color: "var(--gold)", fontWeight: 600 }}>{dosesPerVial.toFixed(1)}</span>
          {" "}doses per vial.
        </div>
      )}

      <VialVisualizer diluentMl={diluentMl} volumePerDose={volumePerDose} doseMg={doseMg} />

      <div style={{ marginTop: 28, textAlign: "center", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
        Visual reference only. Always verify with a calibrated scale.
      </div>

      <div className="disclaimer">
        <strong>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only.
        Not for human or animal consumption.
      </div>

      <style>{`
        @media (max-width: 720px) {
          .calc-grid  { grid-template-columns: 1fr !important; gap: 28px !important; }
          .result-grid { grid-template-columns: 1fr !important; }
          .result-grid > div { border-right: none !important; border-bottom: 1px solid var(--border); }
          .result-grid > div:last-child { border-bottom: none !important; }
        }
      `}</style>
    </div>
  );
}
