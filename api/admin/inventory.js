import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "../_adminAuth.js";

const VALID_STATUSES = ["in_stock", "low", "out_of_stock"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { product_id, stock_status, quantity } = req.body || {};

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  const auth = await requireAdmin(req, supabase);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const pid = typeof product_id !== "undefined" ? parseInt(product_id, 10) : NaN;

  // Update stock_status
  if (product_id !== undefined && stock_status !== undefined) {
    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ error: "Invalid product_id" });
    }
    if (!VALID_STATUSES.includes(stock_status)) {
      return res.status(400).json({ error: "Invalid stock_status" });
    }
    const { data, error } = await supabase
      .from("product_stock")
      .update({ stock_status })
      .eq("product_id", pid)
      .select();
    if (error) return res.status(500).json({ error: "Internal server error" });
    return res.json({ updated: data });
  }

  // Update quantity
  if (product_id !== undefined && quantity !== undefined) {
    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ error: "Invalid product_id" });
    }
    const qty = Math.max(0, parseInt(quantity) || 0);
    if (qty > 1_000_000) return res.status(400).json({ error: "Quantity too large" });
    const qtyUpdate = { quantity: qty };
    if (qty === 0) qtyUpdate.stock_status = "out_of_stock";
    const { data, error } = await supabase
      .from("product_stock")
      .update(qtyUpdate)
      .eq("product_id", pid)
      .select();
    if (error) return res.status(500).json({ error: "Internal server error" });
    return res.json({ updated: data });
  }

  // Fetch all
  const { data, error } = await supabase
    .from("product_stock")
    .select("*")
    .order("product_id");
  if (error) return res.status(500).json({ error: "Internal server error" });
  res.json({ inventory: data });
}
