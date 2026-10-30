/**
 * Resolving and validating the addresses order emails are sent to and from.
 *
 * These values come from the Settings page, which means a human typed them.
 * An unusable value used to fail silently and in the worst possible place: a
 * malformed `senderEmail` becomes a `from` header the SMTP server rejects,
 * which kills *every* email including customer receipts, while a malformed
 * `contactEmail` sends the sales notification nowhere. Both are validated here
 * instead, and an unusable value falls back to something that works.
 */

/**
 * Deliberately permissive: the SMTP server is the real authority on whether an
 * address is deliverable. This only rejects values that cannot be an address at
 * all — blanks, names, and anything missing an `@` or a dotted domain.
 */
const EMAIL_PATTERN = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/;

/** Used when Settings has no usable contact address. */
export const DEFAULT_ADMIN_EMAIL = 'admin@workingongrass.co.za';

export function isEmailish(value: unknown): boolean {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim());
}

/**
 * Parse a settings field that may hold several addresses, separated by commas
 * or semicolons. Unusable entries are dropped rather than failing the whole
 * field, so one typo in a list cannot stop the rest being notified.
 */
export function parseEmailList(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  const found = value
    .split(/[,;]+/)
    .map((part) => part.trim())
    .filter(isEmailish);
  return [...new Set(found)];
}

/**
 * Who `[SALES]` order notifications go to. Supports several addresses so the
 * business is not relying on one mailbox staying healthy, and always returns at
 * least one address — an order must never go unannounced because Settings is
 * blank or mistyped.
 */
export function resolveAdminRecipients(settings: { contactEmail?: string } | null | undefined): string[] {
  const configured = parseEmailList(settings?.contactEmail);
  return configured.length > 0 ? configured : [DEFAULT_ADMIN_EMAIL];
}

/**
 * The `from` address for outgoing mail, or undefined to omit the header and let
 * the Trigger Email extension's own DEFAULT_FROM apply. Omitting is the safer
 * default: the extension's configured sender is known to be accepted by the
 * SMTP provider, whereas an unverified one is routinely refused.
 */
export function resolveSenderEmail(settings: { senderEmail?: string } | null | undefined): string | undefined {
  const sender = typeof settings?.senderEmail === 'string' ? settings.senderEmail.trim() : '';
  return isEmailish(sender) ? sender : undefined;
}

/** True when a mail payload has at least one address to send to. */
export function hasRecipient(to: string | string[] | undefined | null): boolean {
  if (Array.isArray(to)) return to.some((address) => !!address && address.trim().length > 0);
  return typeof to === 'string' && to.trim().length > 0;
}

/** A single address to show in a template, from either shape of `to`. */
export function primaryRecipient(to: string | string[] | undefined | null): string {
  if (Array.isArray(to)) return to.find((address) => !!address) || '';
  return to || '';
}
