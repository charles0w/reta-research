import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase.from("product_stock").select("product_id, stock_status").order("product_id");
  if (error) return res.status(500).json({ error: error.message });
  res.setHeader("Cache-Control", "public, max-age=30");
  res.json({ stock: data });
}
