// Internal helper — call from other API routes, do not expose directly
export async function sendConfirmation({ to, name, items, total, paymentMethod, paymentRef, isSubscription = false }) {
  if (!process.env.RESEND_API_KEY) return;

  const rows = items.map((i) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;font-size:13px;color:#EEEDE6;">${i.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;font-size:13px;color:#5A5A52;text-align:center;">×${i.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;font-size:13px;color:#D4AF37;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td>
    </tr>`).join("");

  const subject = isSubscription
    ? "Subscription Confirmed — Ace Peptides"
    : "Order Confirmed — Ace Peptides";

  const note = isSubscription
    ? "<p style='font-size:12px;color:#5A5A52;margin-top:24px;'>Your subscription will auto-renew per your selected cadence. You will receive a confirmation email for each shipment.</p>"
    : "";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Ace Peptides <orders@ace-peptides.com>",
      to: [to],
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#060606;color:#EEEDE6;padding:48px 40px;">
          <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#D4AF37;margin-bottom:8px;">Ace Peptides</div>
          <h1 style="font-size:22px;font-weight:400;letter-spacing:0.06em;margin:0 0 8px;">${isSubscription ? "Subscription Confirmed" : "Order Confirmed"}</h1>
          <p style="font-size:13px;color:#5A5A52;margin:0 0 32px;">Thank you, ${name}. Your ${isSubscription ? "subscription" : "order"} has been received.</p>

          <table width="100%" style="border-collapse:collapse;margin-bottom:24px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px 0;font-size:10px;letter-spacing:0.14em;color:#2E2E28;border-bottom:1px solid #1a1a1a;">ITEM</th>
                <th style="text-align:center;padding:8px 0;font-size:10px;letter-spacing:0.14em;color:#2E2E28;border-bottom:1px solid #1a1a1a;">QTY</th>
                <th style="text-align:right;padding:8px 0;font-size:10px;letter-spacing:0.14em;color:#2E2E28;border-bottom:1px solid #1a1a1a;">PRICE</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div style="display:flex;justify-content:space-between;padding-top:16px;border-top:1px solid rgba(212,175,55,0.2);">
            <span style="font-size:11px;color:#5A5A52;letter-spacing:0.14em;text-transform:uppercase;">Total</span>
            <span style="font-size:20px;color:#D4AF37;">$${total.toFixed(2)}</span>
          </div>

          <div style="margin-top:32px;padding:16px;background:#0D0D0D;font-size:10px;color:#2E2E28;letter-spacing:0.08em;">
            ${paymentMethod} · Ref: ${paymentRef}
          </div>

          ${note}

          <p style="margin-top:32px;font-size:10px;color:#1e1e18;line-height:1.7;">
            For laboratory research purposes only. Not for human or animal consumption.
          </p>
        </div>
      `,
    }),
  });
}
