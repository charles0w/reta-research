// Shared order side-effects, used by both api/send-order.js (at creation, when a
// payment is verified or verification is unavailable) and api/cron/verify-orders.js
// (when a previously 'pending' order is confirmed on-chain).

// Decrement product_stock for each ordered line. Subscription lines carry the
// real product id in `productId`; regular lines use the numeric `id`.
//
// NOTE: this is a non-atomic read-modify-write and can oversell under heavy
// concurrency. A Postgres RPC (UPDATE ... WHERE quantity >= $qty) is the proper
// fix — tracked as a follow-up.
export async function decrementStock(supabase, items) {
  await Promise.all(
    (items || [])
      .map((item) => ({
        pid: typeof item.productId === "number" ? item.productId : item.id,
        qty: parseInt(item.qty, 10) || 1,
      }))
      .filter((x) => typeof x.pid === "number")
      .map(async ({ pid, qty }) => {
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
      })
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
