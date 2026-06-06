import { createClient } from "@supabase/supabase-js";

const VALID_STATUSES = ["in_stock", "low", "out_of_stock"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { password, product_id, stock_status, quantity } = req.body || {};

  if (!password || password !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  // Update stock_status
  if (product_id !== undefined && stock_status !== undefined) {
    if (!VALID_STATUSES.includes(stock_status)) {
      return res.status(400).json({ error: "Invalid stock_status" });
    }
    const { data, error } = await supabase
      .from("product_stock")
      .update({ stock_status })
      .eq("product_id", product_id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ updated: data });
  }

  // Update quantity
  if (product_id !== undefined && quantity !== undefined) {
    const qty = Math.max(0, parseInt(quantity) || 0);
    const qtyUpdate = { quantity: qty };
    if (qty === 0) qtyUpdate.stock_status = "out_of_stock";
    const { data, error } = await supabase
      .from("product_stock")
      .update(qtyUpdate)
      .eq("product_id", product_id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ updated: data });
  }

  // Fetch all
  const { data, error } = await supabase
    .from("product_stock")
    .select("*")
    .order("product_id");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ inventory: data });
}
