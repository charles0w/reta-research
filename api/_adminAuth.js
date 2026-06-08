import crypto from "crypto";
import { checkRateLimit } from "./_rateLimit.js";

// Fail loudly at cold-start if the admin secret is missing or too weak.
const _adminSecret = process.env.ADMIN_SECRET;
if (!_adminSecret || _adminSecret.length < 32) {
  throw new Error(
    "ADMIN_SECRET must be set to a random string of at least 32 characters"
  );
}

// Separate signing key for session tokens. Falls back to ADMIN_SECRET during a
// transition deploy; set TOKEN_SIGNING_SECRET in all environments and remove the
// fallback once it's confirmed deployed.
const _signingSecret = process.env.TOKEN_SIGNING_SECRET || _adminSecret;

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 15;
const MAX_TTL_MS = 25 * 60 * 60 * 1000; // hard ceiling on token lifetime

const sha = (s) => crypto.createHash("sha256").update(String(s ?? "")).digest();

function safeEqual(a, b) {
  return crypto.timingSafeEqual(sha(a), sha(b));
}

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

export function issueToken(ttlMs = 12 * 60 * 60 * 1000) {
  const now = Date.now();
  const payload = b64url(JSON.stringify({ iat: now, exp: now + ttlMs }));
  const sig = b64url(crypto.createHmac("sha256", _signingSecret).update(payload).digest());
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  const expected = b64url(crypto.createHmac("sha256", _signingSecret).update(payload).digest());
  const sigBuf = fromB64url(sig);
  const expBuf = fromB64url(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const { iat, exp } = JSON.parse(fromB64url(payload).toString());
    return (
      typeof exp === "number" && exp > Date.now() &&
      typeof iat === "number" && (exp - iat) <= MAX_TTL_MS
    );
  } catch {
    return false;
  }
}

export function isAuthorized(req) {
  const header = (req.headers && req.headers.authorization) || "";
  return header.startsWith("Bearer ") && verifyToken(header.slice(7));
}

function clientIp(req) {
  // x-vercel-forwarded-for is set by Vercel's edge and cannot be spoofed by clients.
  const vff = req.headers && req.headers["x-vercel-forwarded-for"];
  if (typeof vff === "string" && vff.length) return vff.split(",")[0].trim();
  const xri = req.headers && req.headers["x-real-ip"];
  if (typeof xri === "string" && xri.length) return xri.trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

async function checkThrottle(ip, supabase) {
  // Layer 1: always enforce the in-process limit regardless of DB availability.
  const inProcess = checkRateLimit(`admin-throttle:${ip}`, { max: MAX_FAILURES, windowMs: WINDOW_MS });
  if (!inProcess.ok) return { blocked: true };

  // Layer 2: durable DB-backed throttle. Fail closed when Supabase is unavailable.
  if (!supabase) {
    console.error("_adminAuth: Supabase not configured; refusing auth");
    return { blocked: true };
  }

  try {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count, error } = await supabase
      .from("admin_login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since);
    if (error) {
      const isMissing =
        error.code === "42P01" ||
        (typeof error.message === "string" && error.message.includes("does not exist"));
      if (isMissing) {
        console.error("_adminAuth: admin_login_attempts table missing — apply db/migrations/0004");
        return { blocked: true };
      }
      // On other transient errors, fail open so the legitimate admin isn't locked out.
      console.error("_adminAuth: checkThrottle DB error:", error.code);
      return { blocked: false };
    }
    if (typeof count === "number" && count >= MAX_FAILURES) {
      return { blocked: true };
    }
  } catch (e) {
    console.error("_adminAuth: checkThrottle unexpected error:", e.message);
    return { blocked: false };
  }
  return { blocked: false };
}

async function logFailure(ip, supabase) {
  if (!supabase) return;
  try {
    await supabase.from("admin_login_attempts").insert({ ip });
  } catch {
    /* best-effort */
  }
}

// Gate for all admin endpoints except login. Accepts only Bearer session tokens.
export async function requireAdmin(req, supabase) {
  const ip = clientIp(req);

  const throttle = await checkThrottle(ip, supabase);
  if (throttle.blocked) {
    return { ok: false, status: 429, error: "Too many attempts. Try again later." };
  }

  if (isAuthorized(req)) return { ok: true };

  await logFailure(ip, supabase);
  return { ok: false, status: 401, error: "Unauthorized" };
}

// Gate for /api/admin/login only. Accepts the raw admin password (once) in
// exchange for a session token. Enforces the same throttle as requireAdmin.
export async function requireLogin(req, supabase) {
  const ip = clientIp(req);

  const throttle = await checkThrottle(ip, supabase);
  if (throttle.blocked) {
    return { ok: false, status: 429, error: "Too many attempts. Try again later." };
  }

  const pw = req.body && req.body.password;
  if (pw && safeEqual(pw, _adminSecret)) {
    return { ok: true };
  }

  await logFailure(ip, supabase);
  return { ok: false, status: 401, error: "Unauthorized" };
}
