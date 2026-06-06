import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { code } = req.body || {};
  if (!code || typeof code !== "string") return res.status(400).json({ error: "Code required" });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from("affiliate_codes")
    .select("id, code, discount_pct, uses_remaining, label")
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .gt("uses_remaining", 0)
    .single();

  if (error || !data) return res.status(404).json({ error: "Invalid or expired code" });

  res.json({ valid: true, discount_pct: data.discount_pct, label: data.label });
}
