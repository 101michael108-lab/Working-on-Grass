/**
 * Human-friendly, sequential order/invoice numbers.
 *
 * Every order still has an unguessable Firestore doc id (used for secure
 * invoice links and internal lookups). Separately, each order is stamped with a
 * sequential `orderNumber` allocated from the `counters/orders` document, and
 * that number is what customers see everywhere — order confirmation, invoice,
 * and order tracking.
 */

/** The first order is numbered here; each subsequent order increments by one. */
export const ORDER_NUMBER_START = 1001;

/** Minimum digits so early numbers stay visually consistent (1001 already fits). */
const PAD = 4;

/** Bare padded number, e.g. 1001 -> "1001". Falls back to the short doc id. */
export function orderNumberLabel(orderNumber?: number | null, fallbackId?: string): string {
  if (orderNumber != null && Number.isFinite(orderNumber)) {
    return String(orderNumber).padStart(PAD, '0');
  }
  return fallbackId ? fallbackId.substring(0, 8).toUpperCase() : '';
}

/** Customer-facing reference with a leading hash, e.g. "#1001". */
export function formatOrderRef(order: { orderNumber?: number | null; id?: string }): string {
  const label = orderNumberLabel(order.orderNumber, order.id);
  return label ? `#${label}` : '#—';
}

/**
 * Parse a user-typed order reference to its numeric value.
 * Accepts "#1001", "1001", " 1001 " etc. Returns null when there are no digits.
 */
export function parseOrderNumber(input: string): number | null {
  const digits = (input || '').replace(/[^0-9]/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}
