const FIELDS = [
  { key: "name",    label: "Full name",      type: "text",  half: false },
  { key: "email",   label: "Email",          type: "email", half: false },
  { key: "address", label: "Street address", type: "text",  half: false },
  { key: "city",    label: "City",           type: "text",  half: true  },
  { key: "state",   label: "State",          type: "text",  half: true  },
  { key: "zip",     label: "ZIP",            type: "text",  half: true  },
];

export default function CartDrawer({
  open, onClose,
  cart, cartTotal, updateQty, removeFromCart,
  walletAddress, txHash, walletError, paymentLoading,
  connectMetaMask, connectCoinbase, payWithWallet,
  cashAppButtonRef, cashAppLoading, cashAppError,
  squareAppId,
  shippingInfo, setShippingInfo,
}) {
  const shippingReady = ["name", "email", "address", "city", "state", "zip"]
    .every((k) => shippingInfo[k]?.trim());

  return (
    <>
      <div
        className={`drawer-backdrop ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`cart-drawer ${open ? "open" : ""}`} aria-label="Shopping cart" aria-hidden={!open}>

        <div className="drawer-header">
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Order</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, letterSpacing: "0.05em" }}>Your Cart</div>
          </div>
          <button onClick={onClose} className="drawer-close" aria-label="Close cart">✕</button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 20, opacity: 0.15, color: "var(--gold)" }}>◈</div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 28 }}>Your cart is empty.</p>
              <button className="btn-outline" onClick={onClose}>Browse Products</button>
            </div>
          ) : (
            <>
              {/* Items */}
              <div style={{ paddingTop: 4 }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <div style={{ padding: "22px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, letterSpacing: "0.04em", marginBottom: 14, lineHeight: 1.45 }}>
                          {item.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                          <span style={{ fontSize: 13, color: "var(--text-secondary)", minWidth: 14, textAlign: "center", fontFamily: "var(--font-serif)" }}>{item.qty}</span>
                          <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{ border: "none", background: "none", cursor: "pointer", fontSize: 9, color: "#804040", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--font-sans)", fontWeight: 600, marginLeft: 4 }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <span className="gold-text" style={{ fontFamily: "var(--font-serif)", fontSize: 18, flexShrink: 0 }}>
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderTop: "1px solid rgba(212,175,55,0.2)", marginTop: 4 }}>
                <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600, fontFamily: "var(--font-sans)" }}>Total</span>
                <span className="gold-text" style={{ fontFamily: "var(--font-serif)", fontSize: 26 }}>${cartTotal.toFixed(2)}</span>
              </div>

              {/* Shipping form */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16, color: "var(--gold)", fontFamily: "var(--font-sans)" }}>
                  Shipping Details
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                  {FIELDS.map(({ key, label, type, half }) => (
                    <input
                      key={key}
                      type={type}
                      placeholder={label}
                      value={shippingInfo[key] || ""}
                      onChange={(e) => setShippingInfo((s) => ({ ...s, [key]: e.target.value }))}
                      style={{
                        width: half ? "calc(50% - 7px)" : "100%",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid rgba(212,175,55,0.22)",
                        color: "var(--text)",
                        padding: "10px 0",
                        fontSize: 12,
                        fontFamily: "var(--font-sans)",
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "rgba(212,175,55,0.65)")}
                      onBlur={(e)  => (e.target.style.borderBottomColor = "rgba(212,175,55,0.22)")}
                    />
                  ))}
                </div>
              </div>

              {/* Payment — gated on shipping */}
              {!shippingReady && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textAlign: "center", padding: "12px 0 16px", borderTop: "1px dashed rgba(212,175,55,0.12)" }}>
                  Complete shipping details to continue
                </div>
              )}

              {shippingReady && (
                <>
                  {/* Crypto */}
                  <div style={{ border: "1px solid var(--border)", padding: "24px", background: "rgba(212,175,55,0.02)", marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12, color: "var(--gold)", fontFamily: "var(--font-sans)" }}>
                      Pay with Crypto
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.75 }}>
                      Connect your wallet to send ETH — instant settlement, no middlemen.
                    </div>
                    {txHash ? (
                      <>
                        <div className="success-msg">Payment sent successfully.</div>
                        <div style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: "monospace", wordBreak: "break-all", marginTop: 8 }}>
                          {txHash.startsWith("cashapp:")
                            ? `Cash App Pay · ${txHash.replace("cashapp:", "")}`
                            : `Tx: ${txHash}`}
                        </div>
                      </>
                    ) : walletAddress ? (
                      <>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>Connected</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "monospace", wordBreak: "break-all", marginTop: 8 }}>{walletAddress}</div>
                        <button className="btn-gold" style={{ width: "100%", padding: 16, marginTop: 18 }} onClick={payWithWallet} disabled={paymentLoading}>
                          {paymentLoading ? "Awaiting wallet…" : `Pay $${cartTotal.toFixed(2)} in ETH`}
                        </button>
                      </>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <button className="btn-gold" style={{ width: "100%", padding: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} onClick={connectCoinbase}>
                          <svg width="18" height="18" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#0052FF"/><path d="M14 6C9.582 6 6 9.582 6 14s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm-2.5 10.5v-5h5v5h-5z" fill="#fff"/></svg>
                          Coinbase Wallet
                        </button>
                        <button className="btn-outline" style={{ width: "100%", padding: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} onClick={connectMetaMask}>
                          <svg width="18" height="18" viewBox="0 0 35 33" fill="none"><path d="M32.958 1L19.4 10.71l2.522-5.962L32.958 1z" fill="#E17726"/><path d="M2.042 1l13.44 9.808-2.4-5.96L2.042 1z" fill="#E27625"/><path d="M28.18 23.26l-3.6 5.51 7.7 2.12 2.21-7.52-6.31-.11z" fill="#E27625"/><path d="M.53 23.37l2.2 7.52 7.69-2.12-3.59-5.51-6.3.11z" fill="#E27625"/></svg>
                          MetaMask
                        </button>
                      </div>
                    )}
                    {walletError && <div className="error-msg">{walletError}</div>}
                  </div>

                  {/* Cash App */}
                  {squareAppId && !txHash && (
                    <div style={{ border: "1px solid var(--border)", padding: "24px", background: "rgba(212,175,55,0.02)", marginBottom: 28 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12, color: "var(--gold)", fontFamily: "var(--font-sans)" }}>
                        ♠ Pay with Cash App
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.75 }}>
                        Pay instantly with Cash App — no wallet setup required.
                      </div>
                      {cashAppError && <div className="error-msg">{cashAppError}</div>}
                      {cashAppLoading
                        ? <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", padding: 16 }}>Processing…</div>
                        : <div ref={cashAppButtonRef} />
                      }
                    </div>
                  )}
                </>
              )}

              <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.75, textAlign: "center", paddingBottom: 40 }}>
                <strong style={{ color: "var(--text-secondary)" }}>Disclaimer:</strong> For laboratory research purposes only. Not for human consumption.
              </div>
            </>
          )}
        </div>
      </aside>

      <style>{`
        .drawer-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          z-index: 400; opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .drawer-backdrop.open { opacity: 1; pointer-events: all; }
        .cart-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(460px, 100vw);
          background: #090909;
          border-left: 1px solid var(--border);
          z-index: 500; display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .cart-drawer.open { transform: translateX(0); }
        .drawer-header {
          padding: 24px 28px;
          border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          flex-shrink: 0; position: sticky; top: 0; background: #090909; z-index: 1;
        }
        .drawer-close {
          background: none; border: 1px solid var(--border);
          color: var(--text-secondary); cursor: pointer;
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          font-size: 16px; transition: border-color 0.2s, color 0.2s;
        }
        .drawer-close:hover { border-color: var(--gold); color: var(--gold); }
        .drawer-body { flex: 1; overflow-y: auto; padding: 0 28px; }
        input::placeholder { color: var(--text-muted); }
      `}</style>
    </>
  );
}
