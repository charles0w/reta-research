import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp } from "./_rateLimit.js";

// 10 attempts per minute per IP — throttles brute-force code enumeration
const RATE = { max: 10, windowMs: 60_000 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const ip = getClientIp(req);
  const rl = checkRateLimit(`validate-code:${ip}`, RATE);
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return res.status(429).json({ error: "Too many requests" });
  }

  const { code } = req.body || {};
  if (!code || typeof code !== "string") return res.status(400).json({ error: "Code required" });
  if (code.length < 8 || code.length > 20) return res.status(400).json({ error: "Invalid or expired code" });

  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!anonKey) return res.status(500).json({ error: "Service unavailable" });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    anonKey,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from("affiliate_codes")
    .select("id, discount_pct, uses_remaining")
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .gt("uses_remaining", 0)
    .single();

  if (error || !data) return res.status(404).json({ error: "Invalid or expired code" });

  res.json({ valid: true, discount_pct: data.discount_pct });
}
