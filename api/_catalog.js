// Authoritative server-side product catalog and subscription tiers.
//
// This is the single source of truth for PRICING on the order path. The client
// catalog (src/App.js) is presentational only and must NOT be trusted for price
// — the browser can send any price/total it likes. Keep these values in sync
// with src/App.js until both read from a shared source (DB or shared JSON).

export const PRODUCTS = {
  1: { name: "Retatrutide 5mg", price: 50.0 },
  2: { name: "Retatrutide 10mg", price: 85.0 },
  3: { name: "Retatrutide 15mg", price: 100.0 },
  // Wholesale 10-vial packs — 10% off the single-vial price. baseId/packOf let
  // stock decrements hit the underlying vial inventory (10 vials per pack).
  101: { name: "Retatrutide 5mg — Wholesale 10-Pack", price: 450.0, baseId: 1, packOf: 10 },
  102: { name: "Retatrutide 10mg — Wholesale 10-Pack", price: 765.0, baseId: 2, packOf: 10 },
  103: { name: "Retatrutide 15mg — Wholesale 10-Pack", price: 900.0, baseId: 3, packOf: 10 },
};

// Subscription discount by tier key (mirrors SUB_TIERS in src/App.js).
export const SUB_TIERS = {
  quarterly: 0.05,
  bimonthly: 0.1,
  monthly: 0.15,
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// Parse a subscription line-item id of the form `sub-<tier>-<productId>`.
function parseSubId(id) {
  const m = /^sub-([a-z]+)-(\d+)$/.exec(String(id));
  if (!m) return null;
  return { tier: m[1], productId: Number(m[2]) };
}

// Recompute the authoritative unit price for one cart line from server data.
// Returns { productId, unitPrice }; throws on an unknown product or tier.
function priceLine(item) {
  const sub = parseSubId(item.id);
  if (sub) {
    const product = PRODUCTS[sub.productId];
    if (!product) throw new Error(`Unknown product ${sub.productId}`);
    const discount = SUB_TIERS[sub.tier];
    if (discount === undefined) throw new Error(`Unknown tier ${sub.tier}`);
    return { productId: sub.productId, unitPrice: round2(product.price * (1 - discount)), packOf: 1 };
  }
  const product = PRODUCTS[item.id];
  if (!product) throw new Error(`Unknown product ${item.id}`);
  // Wholesale packs decrement the base product's vial inventory, packOf per unit.
  return { productId: product.baseId ?? item.id, unitPrice: product.price, packOf: product.packOf ?? 1 };
}

// Compute the authoritative order subtotal (before affiliate discount) from the
// server catalog. Returns { subtotal, priced } where priced[i] aligns with
// cart[i]. Throws if any line references an unknown product/tier or bad qty.
export function priceCart(cart) {
  let subtotal = 0;
  const priced = [];
  for (const item of cart) {
    const qty = parseInt(item.qty, 10);
    if (!Number.isInteger(qty) || qty < 1) throw new Error("Invalid quantity");
    const { productId, unitPrice, packOf } = priceLine(item);
    subtotal += unitPrice * qty;
    priced.push({ productId, unitPrice, qty, stockQty: qty * packOf });
  }
  return { subtotal: round2(subtotal), priced };
}

// Apply a (server-validated) affiliate discount percentage to a subtotal.
export function applyDiscount(subtotal, discountPct) {
  const pct = Number(discountPct) || 0;
  return round2(subtotal * (1 - pct / 100));
}
