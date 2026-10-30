import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase-admin';
import { enforceRateLimit } from '@/lib/rate-limit';
import { isFunnelEvent } from '@/lib/funnel';
import { recordFunnelEvent } from '@/services/funnel-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Counts one funnel step.
 *
 * Public by necessity — the steps being measured happen before anyone signs in.
 * Three things keep that safe: only events on a fixed list are accepted, the
 * body carries nothing but an event name and an optional reason, and the result
 * is an increment on a shared counter. There is nothing here to read back and
 * nothing about a visitor to store, so the worst a bad actor achieves is making
 * the owner's numbers less accurate.
 */
export async function POST(req: NextRequest) {
  // Generous enough for real browsing, low enough to blunt a script.
  const limited = enforceRateLimit(req, 'track', 120, 60_000);
  if (limited) return limited;

  if (!hasAdminCredentials()) {
    // Nothing to record against; succeed quietly so the page never sees an error.
    return NextResponse.json({ ok: true });
  }

  let event: unknown;
  let reason: unknown;
  try {
    const body = (await req.json()) as { event?: unknown; reason?: unknown };
    event = body?.event;
    reason = body?.reason;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!isFunnelEvent(event)) {
    return NextResponse.json({ error: 'Unknown event.' }, { status: 400 });
  }

  await recordFunnelEvent(getAdminFirestore(), event, {
    reason: typeof reason === 'string' ? reason : undefined,
  });

  return NextResponse.json({ ok: true });
}
