import { useState } from "react";

export default function FaqSection({ faqs }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="section-animate" style={{ maxWidth: 760 }}>
      <div className="eyebrow">Support</div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 400, letterSpacing: "0.05em", marginBottom: 56 }}>
        Frequently Asked
      </h2>

      {faqs.map((f, i) => (
        <div key={i} className="faq-item">
          <div
            className="faq-q"
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            role="button"
            aria-expanded={openFaq === i}
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && setOpenFaq(openFaq === i ? null : i)}
          >
            <span>{f.q}</span>
            <span style={{
              fontSize: 22,
              color: "var(--gold)",
              display: "inline-flex",
              marginLeft: 24,
              flexShrink: 0,
              lineHeight: 1,
              transform: openFaq === i ? "rotate(45deg)" : "none",
              transition: "transform 0.24s ease",
            }}>
              +
            </span>
          </div>

          {/* CSS-based accordion — max-height trick */}
          <div style={{
            maxHeight: openFaq === i ? "400px" : "0",
            overflow: "hidden",
            transition: "max-height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}>
            <div className="faq-a">{f.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
