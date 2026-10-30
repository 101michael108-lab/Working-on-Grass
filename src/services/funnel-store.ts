/**
 * Recording funnel steps as a small daily tally.
 *
 * One document per day holding counters, rather than a document per event.
 * A shop this size would otherwise accumulate hundreds of thousands of rows
 * nobody reads, and the dashboard only ever asks "how many", so the detail
 * would be dead weight. It also means nothing about an individual visitor is
 * stored: no identifiers, no addresses, no session, just numbers going up.
 */

import { FieldValue } from 'firebase-admin/firestore';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import { funnelDayId, type FunnelEvent } from '@/lib/funnel';

export const FUNNEL_COLLECTION = 'analytics';

/** Keep a failure reason to a short, safe key — it becomes a Firestore field. */
export function normaliseReason(reason: unknown): string {
  const raw = String(reason ?? '').trim().toLowerCase();
  const safe = raw.replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  return safe.slice(0, 40) || 'unknown';
}

/**
 * Add one to today's tally for an event. Never throws: analytics must not be
 * able to break a checkout, and a lost count matters far less than a lost sale.
 */
export async function recordFunnelEvent(
  db: AdminFirestore,
  event: FunnelEvent,
  options: { reason?: string; now?: Date } = {}
): Promise<void> {
  const day = funnelDayId(options.now ?? new Date());

  try {
    const update: Record<string, unknown> = {
      date: day,
      updatedAt: new Date(),
      counts: { [event]: FieldValue.increment(1) },
    };

    if (event === 'checkout_failed') {
      update.failures = { [normaliseReason(options.reason)]: FieldValue.increment(1) };
    }

    await db.collection(FUNNEL_COLLECTION).doc(day).set(update, { merge: true });
  } catch (e) {
    console.error(`Funnel: could not record ${event}:`, e);
  }
}
