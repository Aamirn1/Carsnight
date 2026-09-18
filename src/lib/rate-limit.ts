// Simple in-memory rate limiter for API endpoints
// (Not distributed, suitable for single-instance deployments)

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodically clean up expired buckets to prevent memory leaks
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return; // at most once per minute
  lastCleanup = now;
  for (const [k, v] of buckets) {
    if (v.resetAt < now) buckets.delete(k);
  }
}

/**
 * Returns true if the request should be allowed, false if rate-limited.
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { ok: boolean; remaining: number; resetAt: number } {
  cleanup();
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  if (existing.count >= maxRequests) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  return { ok: true, remaining: maxRequests - existing.count, resetAt: existing.resetAt };
}

export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "local";
  return ip;
}

export function rateLimitResponse(): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } },
  );
}

// Standard rate limits (per minute per IP)
export const RATE_LIMITS = {
  auth: 10, // login/signup attempts
  listingCreate: 20,
  contact: 5,
  general: 120,
  upload: 30,
};
