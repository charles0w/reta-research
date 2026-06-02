import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const TX_RE = /^0x[0-9a-fA-F]{64}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateBody(body) {
  const { cart, shipping, txHash, total } = body;

  if (!Array.isArray(cart) || cart.length === 0) return "Invalid cart";
  if (typeof total !== "number" || total <= 0) return "Invalid total";
  if (!TX_RE.test(txHash)) return "Invalid txHash";

  const required = ["name", "email", "address", "city", "state", "zip"];
  for (const k of required) {
    if (typeof shipping[k] !== "string" || shipping[k].trim() === "") return `Missing shipping.${k}`;
    if (shipping[k].length > 200) return `shipping.${k} too long`;
  }
  if (!EMAIL_RE.test(shipping.email)) return "Invalid shipping email";

  for (const item of cart) {
    if (typeof item.name !== "string") return "Invalid cart item name";
    if (typeof item.qty !== "number" || item.qty < 1) return "Invalid cart item qty";
    if (typeof item.price !== "number" || item.price < 0) return "Invalid cart item price";
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const error = validateBody(req.body);
  if (error) return res.status(400).json({ error });

  const { cart, shipping, txHash, total } = req.body;

  if (!process.env.RESEND_API_KEY || !process.env.ORDER_EMAIL) {
    console.error("Missing RESEND_API_KEY or ORDER_EMAIL env vars");
    return res.json({ ok: true, warned: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

  const etherscanUrl = `https://etherscan.io/tx/${txHash}`;

  const itemRows = cart
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
      <p style="color:#888;font-size:13px;margin-top:0;">Total: <strong style="color:#D4AF37;">$${Number(total).toFixed(2)} USD</strong></p>

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
            <td style="padding:12px 12px;text-align:right;color:#D4AF37;font-size:18px;font-weight:bold;">$${Number(total).toFixed(2)}</td>
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
      <p style="font-size:11px;color:#555;">Verify on <a href="${esc(etherscanUrl)}" style="color:#888;">Etherscan</a></p>
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
            <td style="padding:12px 12px;text-align:right;color:#D4AF37;font-size:18px;font-weight:bold;">$${Number(total).toFixed(2)}</td>
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

  // Insert order into Supabase
  let orderId = null;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY,
        { auth: { persistSession: false } }
      );
      const { data, error } = await supabase
        .from("orders")
        .insert({
          payment_method: "eth",
          payment_ref: txHash,
          status: "pending",
          items: cart,
          total_usd: Number(total),
          shipping_info: shipping,
        })
        .select("id")
        .single();
      if (error) console.error("Supabase insert error:", error.message);
      else orderId = data.id;
    } catch (err) {
      console.error("Supabase error:", err);
    }
  }

  try {
    await Promise.all([
      resend.emails.send({
        from,
        to: process.env.ORDER_EMAIL,
        subject: `New Order $${Number(total).toFixed(2)} — ${shipping.name.slice(0, 60)}`,
        html: operatorHtml,
      }),
      resend.emails.send({
        from,
        to: shipping.email,
        subject: "Order Confirmed — Ace Peptides",
        html: customerHtml,
      }),
    ]);
    res.json({ ok: true, orderId });
  } catch (err) {
    console.error("Email send error:", err);
    res.json({ ok: true, warned: true, orderId });
  }
}
