import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseKey) return res.status(500).json({ error: "Service unavailable" });
  const supabase = createClient(process.env.SUPABASE_URL, supabaseKey, { auth: { persistSession: false } });

  const { data, error } = await supabase.from("product_stock").select("product_id, stock_status").order("product_id");
  if (error) return res.status(500).json({ error: "Service unavailable" });

  res.setHeader("Cache-Control", "private, max-age=15");
  res.json({ stock: data });
}
