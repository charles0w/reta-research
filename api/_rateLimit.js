// Best-effort in-process rate limiter.
// Each serverless instance has its own state — this limits concentrated attacks
// on a single instance. For production-grade protection use Redis/Upstash.

const store = new Map();
let lastCleanup = 0;

function cleanup(now) {
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export function checkRateLimit(key, { max, windowMs }) {
  const now = Date.now();
  cleanup(now);
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  entry.count++;
  if (entry.count > max) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}

export function getClientIp(req) {
  // x-vercel-forwarded-for and x-real-ip are set by Vercel's edge and
  // cannot be spoofed by clients on Hobby/Pro plans.
  const vff = req.headers && req.headers["x-vercel-forwarded-for"];
  if (typeof vff === "string" && vff.length) return vff.split(",")[0].trim();
  const xri = req.headers && req.headers["x-real-ip"];
  if (typeof xri === "string" && xri.length) return xri.trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}
