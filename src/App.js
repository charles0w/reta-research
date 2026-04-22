import { useState, useRef } from "react";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

// Set this to your ETH wallet address to receive payments
const RECIPIENT_ADDRESS = "0x74e9af21c6060328371b3813689b472132f89cbd";

const coinbaseWallet = new CoinbaseWalletSDK({ appName: "Ace Peptides" });
const coinbaseProvider = coinbaseWallet.makeWeb3Provider();

const products =[
  { id: 1, name: "Retatrutide 5mg", purity: "≥99.1%", form: "Lyophilized Powder", cas: "2381089-83-2", price: 89.00, stock: true },
  { id: 2, name: "Retatrutide 10mg", purity: "≥99.1%", form: "Lyophilized Powder", cas: "2381089-83-2", price: 159.00, stock: true },
  { id: 3, name: "Retatrutide 30mg", purity: "≥99.1%", form: "Lyophilized Powder", cas: "2381089-83-2", price: 399.00, stock: true },
];

const researchFindings =[
  "Changes in body weight over the course of structured studies",
  "Modulation of appetite-related signaling",
  "Alterations in glucose and insulin-related markers",
  "Increased metabolic activity through multi-pathway receptor engagement"
];

const faqs =[
  { q: "What is Retatrutide (LY3437943)?", a: "Retatrutide is a synthetic peptide studied in metabolic and endocrine research. It functions as a triple receptor agonist, interacting with GLP-1, GIP, and glucagon receptors involved in energy balance and glucose regulation." },
  { q: "What observations have been reported in published findings?", a: "In controlled research settings, activation of these pathways has been associated with effects on appetite signaling, metabolic activity, and glucose-related markers." },
  { q: "Is this product for human consumption?", a: "No. This product is intended strictly for laboratory research purposes only. Not for human or animal consumption. Not for use in diagnostic or therapeutic applications." },
  { q: "Who can purchase?", a: "Products are available to qualified researchers, academic institutions, and licensed laboratories. By placing an order you confirm your purchase is solely for legitimate research purposes." },
];

export default function App() {
  const [section, setSection] = useState("products");
  const [cart, setCart] = useState([]);
  const[openFaq, setOpenFaq] = useState(null);
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

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

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
      const ethPrice = data.ethereum.usd;
      const ethAmount = cartTotal / ethPrice;
      const weiAmount = BigInt(Math.round(ethAmount * 1e14)) * 10000n;
      const hexValue = "0x" + weiAmount.toString(16);
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

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'Helvetica Neue', sans-serif", background: "#FAFAF8", color: "#1A1A18", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: #1A1A18; color: #FAFAF8; }
        .nav-link { cursor: pointer; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #8A8A82; transition: color .2s; border: none; background: none; font-family: inherit; }
        .nav-link:hover, .nav-link.active { color: #1A1A18; }
        .card { background: #fff; border: 1px solid #E8E8E4; transition: border-color .25s, box-shadow .25s; }
        .card:hover { border-color: #C8C8C0; box-shadow: 0 8px 32px rgba(0,0,0,.04); }
        .btn-primary { background: #1A1A18; color: #FAFAF8; border: none; padding: 12px 28px; font-size: 13px; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; font-family: inherit; transition: background .2s; }
        .btn-primary:hover { background: #333; }
        .btn-outline { background: none; border: 1px solid #D0D0C8; color: #1A1A18; padding: 10px 24px; font-size: 13px; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; font-family: inherit; transition: all .2s; }
        .btn-outline:hover { border-color: #1A1A18; }
        .tag { display: inline-block; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; padding: 4px 10px; border: 1px solid #E0E0D8; color: #6A6A62; }
        .faq-item { border-bottom: 1px solid #E8E8E4; }
        .faq-q { padding: 20px 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 15px; }
        .faq-a { padding: 0 0 20px; font-size: 14px; color: #6A6A62; line-height: 1.7; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .wallet-box { border: 1px solid #E8E8E4; padding: 24px; margin-top: 8px; }
        .wallet-address { font-size: 12px; color: #6A6A62; font-family: monospace; word-break: break-all; margin-top: 8px; }
        .tx-hash { font-size: 11px; color: #6A6A62; font-family: monospace; word-break: break-all; margin-top: 8px; }
        .divider { display: flex; align-items: center; gap: 16px; margin: 24px 0; color: #AAA; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #E8E8E4; }
        .error-msg { color: #B04040; font-size: 13px; margin-top: 12px; }
        .success-msg { color: #2A7A2A; font-size: 13px; margin-top: 12px; }
      `}</style>

      {/* Header */}
      <header style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E8E8E4" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="serif" style={{ fontSize: 26, fontWeight: 400 }}>Ace</span>
          <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#8A8A82" }}>Peptides</span>
        </div>
        <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {[["products", "Products"], ["research", "Research"], ["faq", "FAQ"]].map(([key, label]) => (
            <button key={key} className={`nav-link ${section === key ? "active" : ""}`} onClick={() => setSection(key)}>{label}</button>
          ))}
          <button className="nav-link" style={{ position: "relative" }} onClick={() => setSection("cart")}>
            Cart {totalItems > 0 && <span style={{ position: "absolute", top: -6, right: -14, background: "#1A1A18", color: "#FAFAF8", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{totalItems}</span>}
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "60px 24px 120px" }}>

        {/* Hero */}
        {section === "products" && (
          <>
            <div style={{ marginBottom: 72, maxWidth: 560 }}>
              <h1 className="serif" style={{ fontSize: 48, fontWeight: 400, lineHeight: 1.15, marginBottom: 20 }}>Research-grade peptides.</h1>
              <p style={{ fontSize: 15, color: "#6A6A62", lineHeight: 1.7 }}>HPLC-verified, ≥99% purity. For in-vitro and laboratory research only.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {products.map((p) => (
                <div key={p.id} className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: "#8A8A82" }}>CAS {p.cas}</div>
                    </div>
                    <span className="tag">{p.purity}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#6A6A62" }}>{p.form}</div>
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 22, fontWeight: 600 }}>${p.price.toFixed(2)}</span>
                    <button className="btn-primary" onClick={() => addToCart(p)}>Add</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 48, padding: 24, background: "#F2F2EE", fontSize: 12, color: "#8A8A82", lineHeight: 1.7, textAlign: "center" }}>
              <strong>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only. Not for human or animal consumption. Not for use in diagnostic or therapeutic applications.
            </div>
          </>
        )}

        {/* Research */}
        {section === "research" && (
          <>
            <h2 className="serif" style={{ fontSize: 36, fontWeight: 400, marginBottom: 12 }}>Retatrutide (LY3437943) Overview</h2>
            <p style={{ fontSize: 14, color: "#6A6A62", marginBottom: 24, lineHeight: 1.7, maxWidth: 600 }}>
              Retatrutide is a synthetic peptide studied in metabolic and endocrine research. It functions as a triple receptor agonist, interacting with GLP-1, GIP, and glucagon receptors involved in energy balance and glucose regulation.
            </p>
            <p style={{ fontSize: 14, color: "#6A6A62", marginBottom: 48, lineHeight: 1.7, maxWidth: 600 }}>
              In controlled research settings, activation of these pathways has been associated with effects on appetite signaling, metabolic activity, and glucose-related markers. Retatrutide continues to be studied for its role in metabolic research.
            </p>

            <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 16 }}>Published Findings</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {researchFindings.map((finding, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #E8E8E4", padding: "20px 28px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "#AAA" }}>•</span>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{finding}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 48, padding: 24, background: "#F2F2EE", fontSize: 12, color: "#8A8A82", lineHeight: 1.7, textAlign: "center" }}>
              <strong>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only. Not for human or animal consumption. Not for use in diagnostic or therapeutic applications.
            </div>
          </>
        )}

        {/* FAQ */}
        {section === "faq" && (
          <>
            <h2 className="serif" style={{ fontSize: 36, fontWeight: 400, marginBottom: 48 }}>Frequently Asked</h2>
            <div>
              {faqs.map((f, i) => (
                <div key={i} className="faq-item">
                  <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{f.q}</span>
                    <span style={{ fontSize: 20, color: "#AAA", transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
                  </div>
                  {openFaq === i && <div className="faq-a">{f.a}</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Cart */}
        {section === "cart" && (
          <>
            <h2 className="serif" style={{ fontSize: 36, fontWeight: 400, marginBottom: 48 }}>Your Cart</h2>
            {cart.length === 0 ? (
              <p style={{ color: "#8A8A82", fontSize: 14 }}>No items yet. <button className="nav-link active" onClick={() => setSection("products")} style={{ textDecoration: "underline", fontSize: 14 }}>Browse products</button></p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: "1px solid #E8E8E4" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: "#8A8A82" }}>Qty: {item.qty}</div>
                    </div>
                    <span style={{ fontWeight: 600 }}>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", fontSize: 18, fontWeight: 600 }}>
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                {/* Web3 Wallet Payment */}
                <div className="wallet-box">
                  <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 12 }}>Pay with Crypto</div>
                  <div style={{ fontSize: 13, color: "#6A6A62", marginBottom: 16, lineHeight: 1.6 }}>
                    Connect your Coinbase Wallet or MetaMask to send ETH directly to us — instant settlement, no middlemen.
                  </div>
                  {txHash ? (
                    <>
                      <div className="success-msg">Payment sent successfully.</div>
                      <div className="tx-hash">Tx: {txHash}</div>
                    </>
                  ) : walletAddress ? (
                    <>
                      <div style={{ fontSize: 12, color: "#8A8A82" }}>Connected</div>
                      <div className="wallet-address">{walletAddress}</div>
                      <button
                        className="btn-primary"
                        style={{ width: "100%", padding: 14, marginTop: 16 }}
                        onClick={payWithWallet}
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? "Awaiting wallet…" : `Pay $${cartTotal.toFixed(2)} in ETH`}
                      </button>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <button className="btn-primary" style={{ width: "100%", padding: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} onClick={connectCoinbase}>
                        <svg width="18" height="18" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="14" fill="#0052FF"/><path d="M14 6C9.582 6 6 9.582 6 14s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm-2.5 10.5v-5h5v5h-5z" fill="#fff"/></svg>
                        Connect Coinbase Wallet
                      </button>
                      <button className="btn-outline" style={{ width: "100%", padding: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} onClick={connectMetaMask}>
                        <svg width="18" height="18" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32.958 1L19.4 10.71l2.522-5.962L32.958 1z" fill="#E17726"/><path d="M2.042 1l13.44 9.808-2.4-5.96L2.042 1z" fill="#E27625"/><path d="M28.18 23.26l-3.6 5.51 7.7 2.12 2.21-7.52-6.31-.11z" fill="#E27625"/><path d="M.53 23.37l2.2 7.52 7.69-2.12-3.59-5.51-6.3.11z" fill="#E27625"/></svg>
                        Connect MetaMask
                      </button>
                    </div>
                  )}
                  {walletError && <div className="error-msg">{walletError}</div>}
                </div>

                <div style={{ marginTop: 24, fontSize: 12, color: "#8A8A82", lineHeight: 1.6, textAlign: "center" }}>
                  <strong>Disclaimer:</strong> This product is intended strictly for laboratory research purposes only. Not for human or animal consumption. Not for use in diagnostic or therapeutic applications.
                </div>
              </>
            )}
          </>
        )}
      </main>

      <footer style={{ borderTop: "1px solid #E8E8E4", padding: "32px 48px", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#AAA" }}>
        <span>© 2026 Ace Peptides (ace-peptides.com). All products for laboratory research use only.</span>
        <span>Terms · Privacy · Contact</span>
      </footer>
    </div>
  );
}