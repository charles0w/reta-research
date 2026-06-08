import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "../_adminAuth.js";

const VALID_STATUSES = ["pending", "shipped", "delivered", "cancelled"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esc = (s) => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id, status, tracking_number } = req.body;

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  const auth = await requireAdmin(req, supabase);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  if (!id || !UUID_RE.test(id) || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid id or status" });
  }

  // Build update payload
  const payload = { status };
  if (typeof tracking_number === "string" && tracking_number.trim() !== "") {
    payload.tracking_number = tracking_number.trim().slice(0, 200);
  }

  const { error } = await supabase
    .from("orders")
    .update(payload)
    .eq("id", id);

  if (error) return res.status(500).json({ error: "Internal server error" });

  // Send customer email for shipped or delivered
  if (status === "shipped" || status === "delivered") {
    try {
      const { data: order, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Supabase fetch error:", fetchError.message);
      } else {
        const ship = order.shipping_info || {};
        const items = order.items || [];
        const total = order.total_usd;

        const itemRows = items
          .map(
            (i) =>
              `<tr>
                <td style="padding:8px 12px;border-bottom:1px solid #222;">${esc(i.name)}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:center;">×${esc(String(i.qty))}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td>
              </tr>`
          )
          .join("");

        const firstName = esc((ship.name || "").split(" ")[0]);

        let subject, bodyHtml;

        if (status === "shipped") {
          subject = "Your order has shipped — Ace Peptides";

          // Use the tracking_number from req.body (already saved to DB) rather than
          // the re-fetched row to avoid stale reads on read replicas.
          const resolvedTracking = payload.tracking_number || order.tracking_number;
          const trackingSection = resolvedTracking
            ? `<div style="margin-bottom:24px;padding:16px;background:#1a1a1a;">
                <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Tracking Number</p>
                <p style="margin:0;font-size:15px;color:#D4AF37;font-weight:bold;">${esc(resolvedTracking)}</p>
              </div>`
            : "";

          bodyHtml = `
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;background:#111;color:#eee;padding:32px;max-width:600px;margin:0 auto;">
              <h1 style="color:#D4AF37;font-size:22px;margin-bottom:4px;">Your order is on its way.</h1>
              <p style="color:#888;margin-top:0;">Hi ${firstName}, your order has shipped. Packages are shipped discreetly.</p>

              ${trackingSection}

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

              <p style="margin-top:28px;font-size:11px;color:#444;line-height:1.8;">
                This product is intended strictly for laboratory research purposes only.<br/>
                Not for human or animal consumption.
              </p>
            </body>
            </html>
          `;
        } else {
          // delivered
          subject = "Your order has been delivered — Ace Peptides";

          bodyHtml = `
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;background:#111;color:#eee;padding:32px;max-width:600px;margin:0 auto;">
              <h1 style="color:#D4AF37;font-size:22px;margin-bottom:4px;">Your order has been delivered.</h1>
              <p style="color:#888;margin-top:0;">Hi ${firstName}, your order has arrived. Thank you for your purchase.</p>

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

              <p style="font-size:13px;color:#888;line-height:1.7;">
                If you have any questions about your order, please reach out to
                <a href="mailto:support@ace-peptides.com" style="color:#D4AF37;">support@ace-peptides.com</a>.
              </p>

              <p style="margin-top:28px;font-size:11px;color:#444;line-height:1.8;">
                This product is intended strictly for laboratory research purposes only.<br/>
                Not for human or animal consumption.
              </p>
            </body>
            </html>
          `;
        }

        if (ship.email) {
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
            await resend.emails.send({
              from,
              to: ship.email,
              subject,
              html: bodyHtml,
            });
          } catch (emailErr) {
            console.error("Resend email error:", emailErr);
          }
        }
      }
    } catch (err) {
      console.error("Error during post-update email flow:", err);
    }
  }

  return res.json({ ok: true });
}
