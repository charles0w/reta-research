import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { verifyPayment } from "../_verifyPayment.js";
import { decrementStock, fetchEthUsd } from "../_fulfill.js";
import { sendCustomerConfirmation } from "../_emails.js";

// Reconciles orders whose payment was still 'pending' at submit time (the tx had
// not been mined yet). Flips them to 'verified' (and applies the deferred stock
// decrement), 'mismatch' (wrong recipient / underpaid / reverted), or 'expired'
// (still no on-chain record after the grace window).
//
// Protected by CRON_SECRET: Vercel sends `Authorization: Bearer <CRON_SECRET>`
// to scheduled invocations when the env var is set. Configure it before relying
// on this endpoint.

const GRACE_HOURS = 24;
const BATCH_SIZE = 50;

const sha256 = (s) => crypto.createHash("sha256").update(String(s)).digest();

export default async function handler(req, res) {
  // Vercel invokes scheduled crons via GET (with Authorization: Bearer CRON_SECRET).
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).end();

  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!secret || !provided || !crypto.timingSafeEqual(sha256(provided), sha256(secret))) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Storage not configured" });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { data: pending, error } = await supabase
    .from("orders")
    .select("id, payment_ref, payment_method, total_usd, items, created_at, shipping_info")
    .in("payment_status", ["pending", "unverified"])
    .limit(BATCH_SIZE);

  if (error) return res.status(500).json({ error: "Internal server error" });

  const ethUsdPrice = await fetchEthUsd();
  const oracleDown = !ethUsdPrice;
  const summary = { checked: 0, verified: 0, mismatch: 0, expired: 0, stillPending: 0, skipped: 0 };

  for (const order of pending || []) {
    // Skip ETH orders when the price oracle is unavailable to avoid spurious underpaid mismatches.
    if (oracleDown && order.payment_method === "eth") {
      summary.skipped++;
      continue;
    }

    summary.checked++;
    let result;
    try {
      result = await verifyPayment({
        txHash: order.payment_ref,
        paymentMethod: order.payment_method,
        expectedUsd: Number(order.total_usd),
        ethUsdPrice,
      });
    } catch (e) {
      console.error(`verify-orders: order ${order.id} error:`, e);
      summary.stillPending++;
      continue;
    }

    if (result.status === "verified") {
      await supabase.from("orders").update({ payment_status: "verified" }).eq("id", order.id);
      try {
        await decrementStock(supabase, order.items);
      } catch (e) {
        console.error(`verify-orders: stock decrement failed for order ${order.id}:`, e);
      }
      // The customer confirmation was deferred at submit time (payment was
      // still pending) — send it now that the payment has confirmed on-chain.
      try {
        await sendCustomerConfirmation({
          orderId: order.id,
          items: order.items,
          totalUsd: order.total_usd,
          txHash: order.payment_ref,
          shipping: order.shipping_info,
        });
      } catch (e) {
        console.error(`verify-orders: confirmation email failed for order ${order.id}:`, e);
      }
      summary.verified++;
    } else if (result.status === "mismatch") {
      await supabase.from("orders").update({ payment_status: "mismatch" }).eq("id", order.id);
      console.warn(`verify-orders: order ${order.id} mismatch — ${result.detail}`);
      summary.mismatch++;
    } else {
      // Still pending. Expire it if it's past the grace window.
      const ageHours = (Date.now() - new Date(order.created_at).getTime()) / 3_600_000;
      if (ageHours > GRACE_HOURS) {
        await supabase.from("orders").update({ payment_status: "expired" }).eq("id", order.id);
        summary.expired++;
      } else {
        summary.stillPending++;
      }
    }
  }

  return res.json({ ok: true, ...summary });
}
