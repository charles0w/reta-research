import { useState } from "react";
import AceLogo from "./AceLogo";

const NAV_ITEMS = [
  ["products",   "Products"],
  ["research",   "Research"],
  ["calculator", "Calculator"],
  ["faq",        "FAQ"],
  ["subscribe",  "Subscribe"],
];

export default function Header({ section, setSection, cartCount, onCartOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (key) => {
    setSection(key);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="site-header">
        {/* Logo */}
        <button className="logo-btn" onClick={() => navigate("products")} aria-label="Home">
          <div className="logo-float">
            <AceLogo size={32} className="logo-glow" />
          </div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, letterSpacing: "0.22em", color: "var(--text)" }}>ACE</div>
            <div style={{ fontSize: 7, letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: 3 }}>PEPTIDES</div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="desktop-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(([key, label]) => (
            <button
              key={key}
              className={`nav-link ${section === key ? "active" : ""}`}
              onClick={() => navigate(key)}
            >
              {label}
            </button>
          ))}

          {/* Cart button */}
          <button
            className="cart-btn"
            onClick={onCartOpen}
            style={{ color: cartCount > 0 ? "var(--gold)" : undefined }}
            aria-label={`Open cart, ${cartCount} items`}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
        </nav>

        {/* Mobile controls */}
        <div className="mobile-controls">
          <button className="cart-btn" onClick={onCartOpen} style={{ color: cartCount > 0 ? "var(--gold)" : undefined }} aria-label="Cart">
            <CartIcon />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <button className="hamburger-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <HamburgerIcon />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
        >
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <AceLogo size={28} />
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 13, letterSpacing: "0.22em" }}>ACE</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="close-btn" aria-label="Close menu">✕</button>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {NAV_ITEMS.map(([key, label], i) => (
                <button
                  key={key}
                  className="mobile-nav-item"
                  style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => navigate(key)}
                >
                  {label}
                  {section === key && <span style={{ color: "var(--gold)", fontSize: 12 }}>◈</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <style>{`
        .site-header {
          padding: 0 48px;
          height: 68px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 200;
          background: rgba(6,6,6,0.92);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--border);
        }
        .logo-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: none;
          border: none;
          cursor: pointer;
        }
        .desktop-nav {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .mobile-controls {
          display: none;
          align-items: center;
          gap: 18px;
        }
        .cart-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          transition: color 0.2s;
          padding: 4px;
        }
        .cart-btn:hover { color: var(--gold); }
        .cart-badge {
          position: absolute;
          top: -6px;
          right: -10px;
          background: var(--gold);
          color: #000;
          border-radius: 50%;
          width: 17px;
          height: 17px;
          font-size: 9px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
        }
        .hamburger-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 4px;
        }
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          z-index: 300;
          animation: fadeIn 0.2s ease;
        }
        .mobile-menu {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: 300px;
          background: var(--surface);
          border-left: 1px solid var(--border);
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          animation: slideInRight 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 20px;
          line-height: 1;
          transition: color 0.2s;
        }
        .close-btn:hover { color: var(--gold); }
        .mobile-nav-item {
          background: none;
          border: none;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          text-align: left;
          font-family: var(--font-serif);
          font-size: 22px;
          letter-spacing: 0.06em;
          color: var(--text);
          padding: 16px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideInLeft 0.35s ease both;
          transition: color 0.2s;
        }
        .mobile-nav-item:hover { color: var(--gold); }

        @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @media (max-width: 768px) {
          .site-header { padding: 0 20px !important; }
          .desktop-nav { display: none !important; }
          .mobile-controls { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
