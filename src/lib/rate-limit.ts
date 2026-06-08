import { NextResponse } from 'next/server';

/**
 * Best-effort in-memory rate limiter (per server instance). On multi-instance
 * deployments each instance throttles independently — a shared store (Firestore
 * /Redis) would enforce a global limit — but this blunts trivial abuse of public
 * endpoints with zero extra infrastructure.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function hit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Opportunistic prune so the map can't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (now >= b.resetAt) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from proxy headers (Cloud Run / App Hosting set XFF). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * Returns a 429 response when the caller exceeds `limit` requests per
 * `windowMs`, or null to proceed. Keyed by route name + client IP.
 */
export function enforceRateLimit(
  req: Request,
  name: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const { ok, retryAfter } = hit(`${name}:${clientIp(req)}`, limit, windowMs);
  if (ok) return null;
  return new NextResponse('Too many requests. Please slow down and try again shortly.', {
    status: 429,
    headers: { 'Retry-After': String(retryAfter) },
  });
}
