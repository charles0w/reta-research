import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { priceCart, applyDiscount } from "./_catalog.js";
import { verifyPayment } from "./_verifyPayment.js";
import { decrementStock, fetchEthUsd } from "./_fulfill.js";
import { checkRateLimit, getClientIp } from "./_rateLimit.js";

const SEND_ORDER_RATE = { max: 5, windowMs: 15 * 60 * 1000 };

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const TX_RE = /^0x[0-9a-fA-F]{64}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_PAYMENT_METHODS = ["eth", "usdc"];
const MAX_CART_ITEMS = 20;
const MAX_ITEM_QTY = 100;

function validateBody(body) {
  const { cart, shipping, txHash, total, paymentMethod = "eth", promoCode } = body;

  if (!Array.isArray(cart) || cart.length === 0) return "Invalid cart";
  if (cart.length > MAX_CART_ITEMS) return "Too many cart items";
  if (typeof total !== "number" || total <= 0) return "Invalid total";
  if (!TX_RE.test(txHash)) return "Invalid txHash";
  if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) return "Invalid payment method";
  // The client sends promoCode: null when no code is applied — treat null like absent.
  if (promoCode != null && (typeof promoCode !== "string" || promoCode.length > 50)) return "Invalid promo code";

  const required = ["name", "email", "address", "city", "state", "zip", "country"];
  for (const k of required) {
    if (typeof shipping[k] !== "string" || shipping[k].trim() === "") return `Missing shipping.${k}`;
    if (shipping[k].length > 200) return `shipping.${k} too long`;
  }
  if (!EMAIL_RE.test(shipping.email)) return "Invalid shipping email";

  for (const item of cart) {
    if (typeof item.name !== "string") return "Invalid cart item name";
    if (typeof item.qty !== "number" || item.qty < 1 || item.qty > MAX_ITEM_QTY) return "Invalid cart item qty";
    if (typeof item.price !== "number" || item.price < 0) return "Invalid cart item price";
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const ip = getClientIp(req);
  const rl = checkRateLimit(`send-order:${ip}`, SEND_ORDER_RATE);
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return res.status(429).json({ error: "Too many requests" });
  }

  const error = validateBody(req.body);
  if (error) return res.status(400).json({ error });

  const { cart, shipping, txHash, total, paymentMethod = "eth", promoCode } = req.body;

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY — cannot record order");
    return res.status(500).json({ error: "Order storage not configured" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  // --- Server-side price authority. The client total/price are NOT trusted;
  // recompute from the server catalog and the server-validated affiliate
  // discount, and reject any mismatch (blocks price tampering). ---
  let affiliate = null;
  let discountPct = 0;
  if (promoCode) {
    const { data: ac } = await supabase
      .from("affiliate_codes")
      .select("id, uses_remaining, discount_pct")
      .eq("code", promoCode.toUpperCase().trim())
      .eq("is_active", true)
      .gt("uses_remaining", 0)
      .single();
    if (ac) {
      affiliate = ac;
      discountPct = ac.discount_pct || 0;
    }
  }

  let serverTotal, serverCart;
  try {
    const { subtotal, priced } = priceCart(cart);
    serverTotal = applyDiscount(subtotal, discountPct);
    // productId/stockQty drive the inventory decrement (wholesale packs map to
    // the base product's vial stock × packOf) — persisted in items so the cron
    // can apply the deferred decrement for pending orders.
    serverCart = cart.map((it, i) => ({ ...it, price: priced[i].unitPrice, productId: priced[i].productId, stockQty: priced[i].stockQty }));
  } catch {
    return res.status(400).json({ error: "Invalid cart items" });
  }
  if (Math.abs(Number(total) - serverTotal) > 0.01) {
    console.warn(`send-order: total mismatch — client ${total} vs server ${serverTotal}`);
    return res.status(400).json({ error: "Order total mismatch" });
  }

  // Idempotency: one on-chain txHash maps to exactly one order. If we've already
  // recorded it (double-submit, retry, replay), return the existing order. The
  // UNIQUE(payment_ref) constraint is the race-safe backstop.
  const { data: existing } = await supabase
    .from("orders")
    .select("id, payment_status")
    .eq("payment_ref", txHash)
    .maybeSingle();
  if (existing) {
    return res.json({ ok: true, orderId: existing.id, paymentStatus: existing.payment_status, duplicate: true });
  }

  // --- On-chain verification. A just-broadcast tx is usually unmined here, so
  // 'pending' is normal; the cron reconciles it later. A clear 'mismatch'
  // (wrong recipient / reverted / underpaid) is rejected outright. ---
  const ethUsdPrice = paymentMethod === "eth" ? await fetchEthUsd() : null;
  const verification = await verifyPayment({
    txHash,
    paymentMethod,
    expectedUsd: serverTotal,
    ethUsdPrice,
  });
  if (verification.status === "mismatch") {
    console.warn(`send-order: payment mismatch for ${txHash} — ${verification.detail}`);
    return res.status(400).json({ error: "Payment could not be verified" });
  }
  const paymentStatus = verification.status; // verified | pending | unverified

  const { data: inserted, error: insertError } = await supabase
    .from("orders")
    .insert({
      payment_method: paymentMethod,
      payment_ref: txHash,
      status: "pending",
      payment_status: paymentStatus,
      items: serverCart,
      total_usd: serverTotal,
      shipping_info: shipping,
    })
    .select("id")
    .single();

  if (insertError) {
    // 23505 = unique_violation: a concurrent request already recorded this tx.
    if (insertError.code === "23505") {
      const { data: dup } = await supabase
        .from("orders")
        .select("id, payment_status")
        .eq("payment_ref", txHash)
        .maybeSingle();
      if (dup) return res.json({ ok: true, orderId: dup.id, paymentStatus: dup.payment_status, duplicate: true });
    }
    console.error("Supabase insert error:", insertError.message);
    return res.status(500).json({ error: "Could not record order" });
  }

  const orderId = inserted.id;

  // Consume affiliate code atomically via DB-level lock (migration 0005).
  // Falls back to an optimistic update if the RPC is not yet deployed.
  if (affiliate) {
    try {
      const { data: consumed } = await supabase.rpc("consume_affiliate_code", { p_id: affiliate.id });
      if (!consumed) {
        console.warn(`send-order: affiliate code ${affiliate.id} already exhausted`);
      }
    } catch {
      try {
        const newUses = Math.max(0, affiliate.uses_remaining - 1);
        await supabase
          .from("affiliate_codes")
          .update({ uses_remaining: newUses, is_active: newUses > 0 })
          .eq("id", affiliate.id)
          .eq("uses_remaining", affiliate.uses_remaining);
      } catch (err2) {
        console.error("Affiliate consume error:", err2);
      }
    }
  }

  // Decrement stock only when the payment is on-chain verified.
  // 'pending' orders defer their stock decrement to the cron once the tx confirms.
  if (paymentStatus === "verified") {
    try {
      await decrementStock(supabase, serverCart);
    } catch (err) {
      console.error("Stock decrement error:", err);
    }
  }

  // --- Best-effort confirmation emails. The order is saved; email failure must
  // NOT fail the request. ---
  if (process.env.RESEND_API_KEY && process.env.ORDER_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const etherscanUrl = `https://etherscan.io/tx/${txHash}`;

      const itemRows = serverCart
        .map(
          (i) =>
            `<tr>
              <td style="padding:8px 12px;border-bottom:1px solid #222;">${esc(i.name)}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:center;">×${esc(String(i.qty))}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td>
            </tr>`
        )
        .join("");

      const firstName = esc(shipping.name.split(" ")[0]);

      const operatorHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;background:#111;color:#eee;padding:32px;max-width:600px;margin:0 auto;">
          <h1 style="color:#D4AF37;font-size:22px;margin-bottom:4px;">New Order — Ace Peptides</h1>
          <p style="color:#888;font-size:13px;margin-top:0;">Total: <strong style="color:#D4AF37;">$${serverTotal.toFixed(2)} USD</strong> · Payment: <strong style="color:#D4AF37;">${esc(paymentStatus)}</strong></p>

          <h3 style="color:#D4AF37;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Items</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
            <thead>
              <tr style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">
                <th style="padding:8px 12px;text-align:left;">Product</th>
                <th style="padding:8px 12px;text-align:center;">Qty</th>
                <th style="padding:8px 12px;text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px 12px;text-align:right;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Total</td>
                <td style="padding:12px 12px;text-align:right;color:#D4AF37;font-size:18px;font-weight:bold;">$${serverTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <h3 style="color:#D4AF37;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Ship To</h3>
          <div style="background:#1a1a1a;padding:16px;font-size:14px;line-height:1.8;margin-bottom:24px;">
            <strong>${esc(shipping.name)}</strong><br/>
            ${esc(shipping.address)}<br/>
            ${esc(shipping.city)}, ${esc(shipping.state)} ${esc(shipping.zip)}<br/>
            ${esc(shipping.country)}
          </div>
          <p style="font-size:13px;color:#aaa;margin-bottom:24px;">Customer email: <a href="mailto:${esc(shipping.email)}" style="color:#D4AF37;">${esc(shipping.email)}</a></p>

          <h3 style="color:#D4AF37;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Payment</h3>
          <div style="background:#1a1a1a;padding:16px;font-size:12px;word-break:break-all;margin-bottom:8px;">
            <a href="${esc(etherscanUrl)}" style="color:#D4AF37;">${esc(txHash)}</a>
          </div>
          <p style="font-size:11px;color:#555;">Status: <strong>${esc(paymentStatus)}</strong> — verify on <a href="${esc(etherscanUrl)}" style="color:#888;">Etherscan</a> before shipping if not yet verified.</p>
        </body>
        </html>
      `;

      const customerHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;background:#111;color:#eee;padding:32px;max-width:600px;margin:0 auto;">
          <h1 style="color:#D4AF37;font-size:22px;margin-bottom:4px;">Order Confirmed</h1>
          <p style="color:#888;margin-top:0;">Thank you, ${firstName}. Your order has been received.</p>

          <h3 style="color:#D4AF37;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Your Order</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px 12px;text-align:right;color:#888;font-size:12px;">Total</td>
                <td style="padding:12px 12px;text-align:right;color:#D4AF37;font-size:18px;font-weight:bold;">$${serverTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <p style="font-size:13px;color:#888;line-height:1.7;">We'll process and ship your order within <strong style="color:#eee;">1–2 business days</strong>. Research compounds are shipped discreetly.</p>

          <div style="margin-top:24px;padding:16px;background:#1a1a1a;font-size:11px;color:#555;line-height:1.7;">
            Transaction: <a href="${esc(etherscanUrl)}" style="color:#888;word-break:break-all;">${esc(txHash)}</a>
          </div>

          <p style="margin-top:28px;font-size:11px;color:#444;line-height:1.8;">
            This product is intended strictly for laboratory research purposes only.<br/>
            Not for human or animal consumption.
          </p>
        </body>
        </html>
      `;

      const emailTasks = [
        resend.emails.send({
          from,
          to: process.env.ORDER_EMAIL,
          subject: `New Order $${serverTotal.toFixed(2)} (${paymentStatus}) — ${shipping.name.slice(0, 60)}`,
          html: operatorHtml,
        }),
      ];
      if (paymentStatus === "verified") {
        emailTasks.push(
          resend.emails.send({
            from,
            to: shipping.email,
            subject: "Order Confirmed — Ace Peptides",
            html: customerHtml,
          })
        );
      }
      await Promise.all(emailTasks);
    } catch (err) {
      console.error("Email send error:", err);
    }
  } else {
    console.warn("RESEND_API_KEY/ORDER_EMAIL not set — order saved, skipping confirmation emails");
  }

  return res.json({ ok: true, orderId, paymentStatus });
}
