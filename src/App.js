import { useState, useRef, useEffect, useCallback } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

import "./styles.css";
import { products, PARTICLES, SQUARE_APP_ID, SQUARE_LOCATION_ID, RECIPIENT_ADDRESS, researchFindings, faqs } from "./data";
import Header from "./components/Header";
import CartDrawer from "./components/CartDrawer";
import ProductsSection from "./sections/ProductsSection";
import ResearchSection from "./sections/ResearchSection";
import CalculatorSection from "./sections/CalculatorSection";
import FaqSection from "./sections/FaqSection";
import SubscribeSection from "./sections/SubscribeSection";
import AdminSection from "./sections/AdminSection";

const coinbaseWallet = new CoinbaseWalletSDK({ appName: "Ace Peptides" });
const coinbaseProvider = coinbaseWallet.makeWeb3Provider();

// ── Toast system ──────────────────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, label = "Added") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, label, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 400);
    }, 2600);
  }, []);

  return { toasts, show };
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.exiting ? "exiting" : ""}`}>
          <div className="toast-gold">{t.label}</div>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function SectionView({ section }) {
  const [displayed, setDisplayed] = useState(section);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setDisplayed(section);
    setAnimKey((k) => k + 1);
  }, [section]);

  return <div key={animKey} className="section-animate">{displayed}</div>;
}

// ── Email capture footer widget ───────────────────────────────────────────
function EmailCapture() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "done" | "error"

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const r = await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      setStatus(r.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div style={{ fontSize: 10, color: "var(--gold)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
        ◈ You're on the list
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input
        type="email"
        placeholder="Research updates"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          background: "transparent", border: "none",
          borderBottom: "1px solid rgba(212,175,55,0.2)",
          color: "var(--text)", padding: "6px 0",
          fontSize: 11, fontFamily: "var(--font-sans)",
          outline: "none", width: 160,
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderBottomColor = "rgba(212,175,55,0.5)")}
        onBlur={(e)  => (e.target.style.borderBottomColor = "rgba(212,175,55,0.2)")}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--gold)", padding: 0 }}
      >
        →
      </button>
      {status === "error" && <span style={{ fontSize: 9, color: "#c04040" }}>Try again</span>}
    </form>
  );
}

export default function App() {
  // ── Admin routing ────────────────────────────────────────────────────────
  if (window.location.pathname === "/admin") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <AdminSection />
      </div>
    );
  }

  const [section, setSection]       = useState("products");
  const [cartOpen, setCartOpen]     = useState(false);
  const [cart, setCart]             = useState([]);
  const { toasts, show: showToast } = useToasts();

  // Wallet
  const [walletAddress, setWalletAddress]   = useState(null);
  const [txHash, setTxHash]                 = useState(null);
  const [walletError, setWalletError]       = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const activeProvider = useRef(null);

  // Cash App (redirect-return state only)
  const [cashAppLoading, setCashAppLoading] = useState(false);
  const [cashAppError, setCashAppError]     = useState(null);

  // Shipping
  const emptyShipping = { name: "", email: "", address: "", city: "", state: "", zip: "" };
  const [shippingInfo, setShippingInfo] = useState(emptyShipping);

  // Calculator
  const [vialMg, setVialMg]       = useState(10);
  const [diluentMl, setDiluentMl] = useState(2);
  const [doseMg, setDoseMg]       = useState(4);
  const [syringeMl, setSyringeMl] = useState(1);

  const cartTotal     = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems    = cart.reduce((s, i) => s + i.qty, 0);
  const shippingReady = ["name", "email", "address", "city", "state", "zip"]
    .every((k) => shippingInfo[k]?.trim());

  const addToCart = useCallback((p) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) return prev.map((i) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
    showToast(p.name, "Added to cart");
  }, [showToast]);

  const removeFromCart = useCallback((id) => setCart((prev) => prev.filter((i) => i.id !== id)), []);

  const updateQty = useCallback((id, delta) =>
    setCart((prev) =>
      prev.flatMap((i) =>
        i.id !== id ? [i] : i.qty + delta < 1 ? [] : [{ ...i, qty: i.qty + delta }]
      )
    ), []);

  // Persist cart + shipping for Cash App redirect round-trip
  useEffect(() => {
    sessionStorage.setItem("ace-cart",     JSON.stringify(cart));
    sessionStorage.setItem("ace-total",    String(cartTotal));
    sessionStorage.setItem("ace-shipping", JSON.stringify(shippingInfo));
  }, [cart, cartTotal, shippingInfo]);

  // Clear payment state when drawer closes after a confirmed payment
  useEffect(() => {
    if (!cartOpen && txHash) {
      setTxHash(null);
      setWalletAddress(null);
      setWalletError(null);
      setShippingInfo(emptyShipping);
      setCart([]);
      activeProvider.current = null;
    }
  }, [cartOpen]); // eslint-disable-line

  // Cash App redirect return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("transactionId") || !SQUARE_APP_ID) return;
    setCashAppLoading(true);
    setCartOpen(true);
    const saved = sessionStorage.getItem("ace-cart");
    if (saved) setCart(JSON.parse(saved));

    (async () => {
      try {
        await loadSquare();
        const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        const cap = await payments.cashAppPay({ redirectURL: window.location.origin, referenceId: sessionStorage.getItem("ace-ref") || "" });
        const result = await cap.tokenize();
        if (result.status !== "OK") throw new Error(result.errors?.[0]?.message || "Tokenization failed");

        const savedCart     = JSON.parse(sessionStorage.getItem("ace-cart")     || "[]");
        const savedTotal    = parseFloat(sessionStorage.getItem("ace-total")    || "0");
        const savedShipping = JSON.parse(sessionStorage.getItem("ace-shipping") || "{}");
        const r = await fetch("/api/complete-square-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: result.token, items: savedCart, total: savedTotal, shippingInfo: savedShipping }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Payment failed");

        setTxHash("cashapp:" + data.paymentId);
        sessionStorage.removeItem("ace-cart");
        sessionStorage.removeItem("ace-total");
        sessionStorage.removeItem("ace-ref");
        window.history.replaceState({}, "", "/");
      } catch (err) {
        setCashAppError(err.message);
      } finally {
        setCashAppLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  const loadSquare = () =>
    new Promise((resolve) => {
      if (window.Square) return resolve();
      const s = document.createElement("script");
      s.src = "https://web.squarecdn.com/v1/square.js";
      s.onload = resolve;
      document.head.appendChild(s);
    });

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
    if (!window.ethereum) { setWalletError("MetaMask not detected. Please install the MetaMask extension."); return; }
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
      fetch("/api/save-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total: cartTotal, paymentMethod: "eth", paymentRef: tx, status: "sent", shippingInfo }),
      }).catch(() => {});
    } catch (err) {
      setWalletError(err.message || "Transaction failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const payWithCard = async (token) => {
    setPaymentLoading(true);
    setWalletError(null);
    try {
      const r = await fetch("/api/create-card-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, items: cart, total: cartTotal, shippingInfo }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Payment failed");
      setTxHash("card:" + data.paymentId);
    } catch (err) {
      setWalletError(err.message || "Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (process.env.REACT_APP_KILL_SWITCH === "true") {
    return (
      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, fontFamily: "var(--font-sans)" }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 22, letterSpacing: "0.2em" }}>ACE PEPTIDES</span>
        <p style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Temporarily Unavailable</p>
      </div>
    );
  }

  const sectionMap = {
    products: <ProductsSection products={products} onAdd={addToCart} />,
    research: <ResearchSection researchFindings={researchFindings} />,
    calculator: (
      <CalculatorSection
        vialMg={vialMg} setVialMg={setVialMg}
        diluentMl={diluentMl} setDiluentMl={setDiluentMl}
        doseMg={doseMg} setDoseMg={setDoseMg}
        syringeMl={syringeMl} setSyringeMl={setSyringeMl}
      />
    ),
    faq: <FaqSection faqs={faqs} />,
    subscribe: <SubscribeSection products={products} />,
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", background: "var(--bg)" }}>

      {/* Particle field */}
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

      <ToastContainer toasts={toasts} />

      <Header
        section={section}
        setSection={setSection}
        cartCount={totalItems}
        onCartOpen={() => setCartOpen(true)}
      />

      <div className="divider-gold" />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        updateQty={updateQty}
        removeFromCart={removeFromCart}
        walletAddress={walletAddress}
        txHash={txHash}
        walletError={walletError}
        paymentLoading={paymentLoading}
        connectMetaMask={connectMetaMask}
        connectCoinbase={connectCoinbase}
        payWithWallet={payWithWallet}
        payWithCard={payWithCard}
        cashAppLoading={cashAppLoading}
        cashAppError={cashAppError}
        shippingInfo={shippingInfo}
        setShippingInfo={setShippingInfo}
        shippingReady={shippingReady}
      />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 40px 140px", position: "relative", zIndex: 1 }}>
        <SectionView section={sectionMap[section]} />
      </main>

      <div className="divider-gold" />

      <footer className="site-footer">
        <span>© 2026 Ace Peptides — All products for laboratory research use only.</span>
        <EmailCapture />
        <div style={{ display: "flex", gap: 20 }}>
          {["Terms", "Privacy", "Contact"].map((l) => (
            <span key={l} className="footer-link">{l}</span>
          ))}
        </div>
      </footer>

      <style>{`
        .section-animate {
          animation: sectionFadeUp 0.42s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        @keyframes sectionFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .site-footer {
          padding: 28px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9px;
          color: var(--text-muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: var(--font-sans);
          gap: 24px;
          flex-wrap: wrap;
        }
        .footer-link {
          cursor: pointer;
          transition: color 0.2s;
        }
        .footer-link:hover { color: var(--gold); }
        @media (max-width: 720px) {
          main { padding: 48px 20px 100px !important; }
          .site-footer { padding: 22px 20px !important; flex-direction: column !important; gap: 16px; text-align: center; }
        }
      `}</style>

      <Analytics />
      <SpeedInsights />
    </div>
  );
}
