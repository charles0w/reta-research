import crypto from "crypto";

const WINDOW_MS = 15 * 60 * 1000; // throttle window
const MAX_FAILURES = 15; // max failed attempts per IP per window

const sha = (s) => crypto.createHash("sha256").update(String(s ?? "")).digest();

// Constant-time comparison via fixed-size digests (no length leak / no throw).
function safeEqual(a, b) {
  return crypto.timingSafeEqual(sha(a), sha(b));
}

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

// Issue a short-lived HMAC session token signed with ADMIN_SECRET. Lets a client
// authenticate once (via /api/admin/login) and stop replaying the password.
export function issueToken(ttlMs = 12 * 60 * 60 * 1000) {
  const payload = b64url(JSON.stringify({ exp: Date.now() + ttlMs }));
  const sig = b64url(crypto.createHmac("sha256", process.env.ADMIN_SECRET || "").update(payload).digest());
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  const expected = b64url(crypto.createHmac("sha256", process.env.ADMIN_SECRET || "").update(payload).digest());
  const sigBuf = fromB64url(sig);
  const expBuf = fromB64url(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const { exp } = JSON.parse(fromB64url(payload).toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

// True if the request carries a valid Bearer session token or the admin password.
export function isAuthorized(req) {
  const header = (req.headers && req.headers.authorization) || "";
  if (header.startsWith("Bearer ") && verifyToken(header.slice(7))) return true;
  const pw = req.body && req.body.password;
  if (pw && process.env.ADMIN_SECRET && safeEqual(pw, process.env.ADMIN_SECRET)) return true;
  return false;
}

function clientIp(req) {
  const xff = req.headers && req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) return xff.split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

// Centralized admin gate with constant-time auth + per-IP brute-force throttling.
// Pass the supabase client (used for the attempt log; tolerates a null/absent
// table by skipping the throttle). Returns { ok: true } or { ok, status, error }.
export async function requireAdmin(req, supabase) {
  const ip = clientIp(req);

  try {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("admin_login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since);
    if (typeof count === "number" && count >= MAX_FAILURES) {
      return { ok: false, status: 429, error: "Too many attempts. Try again later." };
    }
  } catch {
    // attempts table missing / supabase unavailable — skip throttle, still auth.
  }

  if (isAuthorized(req)) return { ok: true };

  try {
    await supabase.from("admin_login_attempts").insert({ ip });
  } catch {
    /* best-effort logging */
  }
  return { ok: false, status: 401, error: "Unauthorized" };
}
