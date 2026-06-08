// Shared order side-effects, used by both api/send-order.js (at creation, when a
// payment is verified or verification is unavailable) and api/cron/verify-orders.js
// (when a previously 'pending' order is confirmed on-chain).

// Atomically decrement a single product's stock. Prefers the oversell-safe
// Postgres RPC (db/migrations/0003); falls back to a non-atomic read-modify-write
// if the RPC isn't present yet (e.g. migration not applied), so there is no
// regression window before the migration runs.
async function decrementOne(supabase, pid, qty) {
  const { error } = await supabase.rpc("decrement_stock", { p_product_id: pid, p_qty: qty });
  if (!error) return;
  console.warn(`decrement_stock RPC unavailable for ${pid} (${error.message}); using fallback`);
  const { data: stock } = await supabase
    .from("product_stock")
    .select("quantity")
    .eq("product_id", pid)
    .single();
  if (stock) {
    const newQty = Math.max(0, (stock.quantity || 0) - qty);
    const update = { quantity: newQty };
    if (newQty === 0) update.stock_status = "out_of_stock";
    await supabase.from("product_stock").update(update).eq("product_id", pid);
  }
}

// Decrement product_stock for each ordered line. Subscription lines carry the
// real product id in `productId`; regular lines use the numeric `id`.
export async function decrementStock(supabase, items) {
  await Promise.all(
    (items || [])
      .map((item) => ({
        pid: typeof item.productId === "number" ? item.productId : item.id,
        qty: parseInt(item.qty, 10) || 1,
      }))
      .filter((x) => typeof x.pid === "number")
      .map(({ pid, qty }) => decrementOne(supabase, pid, qty))
  );
}

// Fetch the current ETH/USD price (best-effort; returns null on failure).
export async function fetchEthUsd() {
  try {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const j = await r.json();
    return j?.ethereum?.usd ?? null;
  } catch {
    return null;
  }
}
