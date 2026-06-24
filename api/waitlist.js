import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp } from "./_rateLimit.js";

// 5 signups per minute per IP — enough for a genuine visitor, throttles abuse.
const RATE = { max: 5, windowMs: 60_000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 200;
const MAX_PRODUCT = 100;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const ip = getClientIp(req);
  const rl = checkRateLimit(`waitlist:${ip}`, RATE);
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return res.status(429).json({ error: "Too many requests" });
  }

  const { email, product } = req.body || {};
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim()) || email.length > MAX_EMAIL) {
    return res.status(400).json({ error: "A valid email is required" });
  }
  // product is optional ("Any / not sure yet" → null). Length-cap any value.
  if (product != null && (typeof product !== "string" || product.length > MAX_PRODUCT)) {
    return res.status(400).json({ error: "Invalid product" });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!process.env.SUPABASE_URL || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY — cannot record waitlist signup");
    return res.status(500).json({ error: "Service unavailable" });
  }

  const supabase = createClient(process.env.SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });

  const normalizedProduct = typeof product === "string" && product.trim() !== "" ? product.trim() : null;

  const { error } = await supabase
    .from("waitlist")
    .insert({ email: email.trim().toLowerCase(), product: normalizedProduct });

  // 23505 = unique_violation: already on the list for this product. Idempotent —
  // treat as success so a re-submit looks the same to the visitor.
  if (error && error.code !== "23505") {
    console.error("Waitlist insert error:", error.message);
    return res.status(500).json({ error: "Could not join the waitlist" });
  }

  res.json({ ok: true });
}
