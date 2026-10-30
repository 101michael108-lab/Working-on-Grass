import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore, hasAdminCredentials } from '@/lib/firebase-admin';
import { isAdminUid } from '@/lib/admin-config';
import { dispatchQueuedMail } from '@/services/email-transport';
import type { MailDoc } from '@/lib/mail-delivery';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SESSION_COOKIE = '__session';

/**
 * Sends an outbox document that the admin dashboard has queued.
 *
 * The dashboard writes to the `mail` collection with the client SDK (admins are
 * permitted to by the Firestore rules) but cannot send it: the provider API key
 * must never reach a browser. So it posts the document id here and the server
 * does the sending.
 *
 * Only the id crosses the wire — the email's content is read back from
 * Firestore, so this route cannot be used to send arbitrary mail even by an
 * admin, and there is no payload to keep in sync with the templates.
 */
export async function POST(req: NextRequest) {
  if (!hasAdminCredentials()) {
    return NextResponse.json({ error: 'Server is not configured to send email.' }, { status: 503 });
  }

  const session = req.cookies.get(SESSION_COOKIE)?.value;
  if (!session) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    if (decoded.admin !== true && !isAdminUid(decoded.uid)) {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  let mailId: string;
  try {
    const body = (await req.json()) as { mailId?: unknown };
    mailId = String(body?.mailId ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // A document id, not a path — this route must not be able to read elsewhere.
  if (!mailId || mailId.includes('/')) {
    return NextResponse.json({ error: 'A mailId is required.' }, { status: 400 });
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection('mail').doc(mailId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Queued email not found.' }, { status: 404 });
    }

    const doc = snap.data() as Partial<MailDoc>;
    // Idempotent: re-posting the same id must not send the email twice.
    if (doc.delivery?.state === 'SUCCESS') {
      return NextResponse.json({ ok: true, state: 'SUCCESS', alreadySent: true });
    }

    const transport = await dispatchQueuedMail(db, mailId, doc);
    if (transport === 'extension') {
      return NextResponse.json({ ok: true, transport, state: 'PENDING' });
    }

    const after = await db.collection('mail').doc(mailId).get();
    const state = (after.data() as Partial<MailDoc> | undefined)?.delivery?.state ?? 'UNKNOWN';
    return NextResponse.json({ ok: state === 'SUCCESS', transport, state });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('dispatch-mail error:', message);
    return NextResponse.json({ error: 'Could not send the queued email.' }, { status: 500 });
  }
}
