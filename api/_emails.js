// Customer order-confirmation email, shared by api/send-order.js (orders
// verified at submit) and api/cron/verify-orders.js (orders that verify later).
// Best-effort by design: callers must never fail an order on an email error.

import { Resend } from "resend";

export const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const shortOrderId = (id) => String(id || "").slice(0, 8).toUpperCase();

export function itemRowsHtml(items) {
  return (items || [])
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #222;">${esc(i.name)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:center;">×${esc(String(i.qty))}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td>
        </tr>`
    )
    .join("");
}

export function customerConfirmationHtml({ orderId, items, totalUsd, txHash, shipping }) {
  const firstName = esc(String(shipping?.name || "").split(" ")[0]);
  const etherscanUrl = `https://etherscan.io/tx/${txHash}`;
  const total = Number(totalUsd).toFixed(2);
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;background:#111;color:#eee;padding:32px;max-width:600px;margin:0 auto;">
      <h1 style="color:#D4AF37;font-size:22px;margin-bottom:4px;">Order Confirmed</h1>
      <p style="color:#888;margin-top:0;">Thank you, ${firstName}. Your order <strong style="color:#D4AF37;">#${esc(shortOrderId(orderId))}</strong> has been received.</p>

      <h3 style="color:#D4AF37;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Your Order</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
        <tbody>${itemRowsHtml(items)}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 12px;text-align:right;color:#888;font-size:12px;">Total</td>
            <td style="padding:12px 12px;text-align:right;color:#D4AF37;font-size:18px;font-weight:bold;">$${total}</td>
          </tr>
        </tfoot>
      </table>

      <p style="font-size:13px;color:#888;line-height:1.7;">We'll process and ship your order within <strong style="color:#eee;">1–2 business days</strong>. Research compounds are shipped discreetly. Reference order <strong style="color:#eee;">#${esc(shortOrderId(orderId))}</strong> in any support inquiry.</p>

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
}

// Sends the confirmation to the customer. Returns true if a send was attempted
// and accepted by Resend; false when email isn't configured. Throws on send
// failure — callers catch and log.
export async function sendCustomerConfirmation({ orderId, items, totalUsd, txHash, shipping }) {
  if (!process.env.RESEND_API_KEY || !shipping?.email) return false;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  await resend.emails.send({
    from,
    to: shipping.email,
    subject: `Order Confirmed #${shortOrderId(orderId)} — Ace Peptides`,
    html: customerConfirmationHtml({ orderId, items, totalUsd, txHash, shipping }),
  });
  return true;
}
