import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  // Use the service key (server-only). product_stock has RLS enabled with no
  // anon policy (db/migrations/0009), so the anon key would read nothing — and
  // we deliberately project only product_id/stock_status so the response never
  // leaks the exact `quantity` column.
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseKey) return res.status(500).json({ error: "Service unavailable" });
  const supabase = createClient(process.env.SUPABASE_URL, supabaseKey, { auth: { persistSession: false } });

  const { data, error } = await supabase.from("product_stock").select("product_id, stock_status").order("product_id");
  if (error) return res.status(500).json({ error: "Service unavailable" });

  res.setHeader("Cache-Control", "private, max-age=15");
  res.json({ stock: data });
}
