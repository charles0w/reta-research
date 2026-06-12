import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "../_adminAuth.js";
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

  const { action, code_id, label, uses = 1, discount_pct = 10, custom_code } = req.body || {};

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  const auth = await requireAdmin(req, supabase);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  // Generate a new code — random by default, or a custom vanity code.
  if (action === "generate") {
    let code;
    if (custom_code) {
      code = String(custom_code).toUpperCase().trim();
      // Min 8 chars to match the validate-code endpoint's minimum length.
      if (!/^[A-Z0-9-]{8,24}$/.test(code)) {
        return res.status(400).json({ error: "Custom code must be 8–24 characters: letters, numbers, dashes" });
      }
    } else {
      code = generateCode();
    }
    const qty = Math.max(1, parseInt(uses) || 1);
    const disc = Math.min(100, Math.max(1, parseInt(discount_pct) || 10));
    const { data, error } = await supabase
      .from("affiliate_codes")
      .insert({ code, discount_pct: disc, uses_remaining: qty, uses_total: qty, label: label || null })
      .select()
      .single();
    if (error) {
      if (error.code === "23505") return res.status(409).json({ error: "That code already exists" });
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.json({ code: data });
  }

  // Deactivate a code
  if (action === "deactivate" && code_id) {
    const { error } = await supabase
      .from("affiliate_codes")
      .update({ is_active: false })
      .eq("id", code_id);
    if (error) return res.status(500).json({ error: "Internal server error" });
    return res.json({ ok: true });
  }

  // List all codes (admin only — bypasses RLS via service key)
  const { data, error } = await supabase
    .from("affiliate_codes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: "Internal server error" });
  res.json({ codes: data });
}
