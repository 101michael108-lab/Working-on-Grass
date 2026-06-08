import crypto from 'crypto';

/**
 * Short-lived, signed capability token for invoice links.
 *
 * Encodes { orderId, uid, exp } and HMAC-signs it so an invoice URL can be
 * shared/logged without exposing a permanent, raw (orderId, uid) capability.
 * Server-only (uses Node crypto). If no secret is configured, signing/verifying
 * return null and callers fall back to the raw-id path — so nothing breaks.
 */
const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function secret(): string {
  return (
    process.env.INVOICE_TOKEN_SECRET?.trim() ||
    process.env.PAYFAST_PASSPHRASE?.trim() ||
    ''
  );
}

export function signInvoiceToken(orderId: string, uid: string, ttlMs: number = DEFAULT_TTL_MS): string | null {
  const s = secret();
  if (!s || !orderId || !uid) return null;
  const payload = Buffer.from(JSON.stringify({ o: orderId, u: uid, e: Date.now() + ttlMs })).toString('base64url');
  const sig = crypto.createHmac('sha256', s).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyInvoiceToken(token: string): { orderId: string; uid: string } | null {
  const s = secret();
  if (!s || !token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;

  const expected = crypto.createHmac('sha256', s).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { o?: string; u?: string; e?: number };
    if (!data.o || !data.u || typeof data.e !== 'number' || Date.now() > data.e) return null;
    return { orderId: data.o, uid: data.u };
  } catch {
    return null;
  }
}
