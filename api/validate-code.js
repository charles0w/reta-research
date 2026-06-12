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

  // Use the service key (server-only). affiliate_codes has RLS enabled with no
  // anon policy (db/migrations/0009) so the anon key can no longer dump every
  // code via the Data API; this endpoint stays the only public lookup path and
  // keeps its per-IP rate limit above. It returns only discount_pct — never the
  // code list or remaining-use counts.
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) return res.status(500).json({ error: "Service unavailable" });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    serviceKey,
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
