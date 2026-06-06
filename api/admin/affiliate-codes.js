import { createClient } from "@supabase/supabase-js";
import { randomInt } from "crypto";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    if (i === 4) code += "-";
    code += chars[randomInt(0, chars.length)];
  }
  return code;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { password, action, code_id, label, uses = 1, discount_pct = 10 } = req.body || {};

  if (!password || password !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  // Generate a new code
  if (action === "generate") {
    const code = generateCode();
    const qty = Math.max(1, parseInt(uses) || 1);
    const disc = Math.min(100, Math.max(1, parseInt(discount_pct) || 10));
    const { data, error } = await supabase
      .from("affiliate_codes")
      .insert({ code, discount_pct: disc, uses_remaining: qty, uses_total: qty, label: label || null })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ code: data });
  }

  // Deactivate a code
  if (action === "deactivate" && code_id) {
    const { error } = await supabase
      .from("affiliate_codes")
      .update({ is_active: false })
      .eq("id", code_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  // List all codes (admin only — bypasses RLS via service key)
  const { data, error } = await supabase
    .from("affiliate_codes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ codes: data });
}
