/**
 * Where a queued email actually gets sent.
 *
 * The `mail` collection stays as a durable outbox — every email is written
 * there before any send is attempted, which is what makes a send retryable and
 * what the admin Email Log reads. What changed is who does the sending.
 *
 * Previously the write *was* the send: the Firebase Trigger Email extension
 * picked the document up out of band, so the application never learned whether
 * the email left the building, and the SMTP configuration lived in the Firebase
 * console where it could not be reviewed or versioned.
 *
 * Now the server calls the provider itself and writes the real outcome back
 * into the same `delivery` field the extension used, so the Email Log works
 * unchanged for both. `EMAIL_TRANSPORT=extension` keeps the old behaviour, which
 * makes this safe to deploy before any provider credentials exist and leaves the
 * extension available as a fallback.
 */

import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import type { MailDelivery, MailDoc } from '@/lib/mail-delivery';

export type MailTransport = 'resend' | 'extension';

export const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/** Resend's documented default is 2 requests/second, so a 429 is expected. */
const MAX_SEND_ATTEMPTS = 3;
/** Bounded because the caller is a payment webhook that must not time out. */
const MAX_RETRY_WAIT_MS = 2_000;

/** The environment variables this module reads. Indexed so `process.env` fits. */
export type TransportEnv = {
  EMAIL_TRANSPORT?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  [key: string]: string | undefined;
};

/**
 * Which transport the current configuration selects.
 *
 * With `EMAIL_TRANSPORT` unset, the provider is used as soon as an API key
 * exists — so switching over is adding one variable, and reverting is removing
 * it. An explicit value always wins, which is the escape hatch if the provider
 * has an outage and the extension needs to take over.
 */
export function resolveTransport(env: TransportEnv): MailTransport {
  const explicit = (env.EMAIL_TRANSPORT ?? '').trim().toLowerCase();
  if (explicit === 'resend') return 'resend';
  if (explicit === 'extension') return 'extension';
  return (env.RESEND_API_KEY ?? '').trim() ? 'resend' : 'extension';
}

/**
 * The From header for a direct provider send.
 *
 * `EMAIL_FROM` takes precedence over the address in Settings because the
 * verified sending domain is infrastructure, not a shop preference: Resend
 * rejects a `from` outside a domain you have verified, so letting a typed
 * Settings value override it would be letting the dashboard break all mail.
 * Unlike the extension, a provider send cannot omit `from` at all.
 */
export function resolveFromAddress(opts: { envFrom?: string; docFrom?: string }): string | undefined {
  const envFrom = (opts.envFrom ?? '').trim();
  if (envFrom) return envFrom;
  const docFrom = (opts.docFrom ?? '').trim();
  return docFrom || undefined;
}

type ResendAttachment = {
  filename?: string;
  /** A URL Resend fetches at send time; does not count toward the size limit. */
  path?: string;
  content_type?: string;
};

export type ResendPayload = {
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: ResendAttachment[];
};

function asList(value: string | string[] | undefined | null): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  const single = (value ?? '').trim();
  return single ? [single] : [];
}

/**
 * Map an outbox document to Resend's request body. The outbox keeps the
 * extension's own document shape, so this is the only place that knows about
 * either format and swapping provider means writing one more of these.
 */
export function toResendPayload(doc: Partial<MailDoc>, from: string): ResendPayload {
  const to = asList(doc.to);
  if (to.length === 0) throw new Error('no recipient');

  const subject = doc.message?.subject ?? '';
  const html = doc.message?.html;
  const text = doc.message?.text;
  if (!html && !text) throw new Error('email has neither an html nor a text body');

  const payload: ResendPayload = { from, to, subject };
  if (html) payload.html = html;
  if (text) payload.text = text;

  const replyTo = asList(doc.replyTo);
  if (replyTo.length > 0) payload.reply_to = replyTo[0];

  const cc = asList(doc.cc);
  if (cc.length > 0) payload.cc = cc;
  const bcc = asList(doc.bcc);
  if (bcc.length > 0) payload.bcc = bcc;

  // Attachments are referenced by URL, which Resend fetches at send time and
  // which does not count toward its size limit. One without a path is dropped
  // rather than failing the email.
  const attachments: ResendAttachment[] = [];
  for (const raw of doc.message?.attachments ?? []) {
    const a = raw as { filename?: string; path?: string; contentType?: string };
    if (!a?.path) continue;
    attachments.push({
      ...(a.filename ? { filename: a.filename } : {}),
      path: a.path,
      ...(a.contentType ? { content_type: a.contentType } : {}),
    });
  }
  if (attachments.length > 0) payload.attachments = attachments;

  return payload;
}

/** A rate limit or an upstream fault is worth another attempt; a 4xx is not. */
export function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 408 || status >= 500;
}

/** How long to wait before retrying, from Resend's `retry-after` header. */
export function retryDelayMs(retryAfterHeader: string | null, attempt: number): number {
  const seconds = Number(retryAfterHeader);
  if (Number.isFinite(seconds) && seconds > 0) return Math.min(seconds * 1000, MAX_RETRY_WAIT_MS);
  return Math.min(250 * 2 ** (attempt - 1), MAX_RETRY_WAIT_MS);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** How long the claim below holds before the extension may treat it as stuck. */
const CLAIM_LEASE_MS = 2 * 60 * 1000;

/**
 * The `delivery` value to write when *creating* a document this app will send
 * itself.
 *
 * The Trigger Email extension claims any document that arrives without a
 * `delivery` field, so if it is still installed when the provider is switched
 * on, both would send — two receipts per customer. Creating the document
 * already marked PROCESSING, with a lease, means the extension leaves it alone.
 * The real outcome overwrites this moments later.
 *
 * This only covers the overlap during a switchover. The extension should still
 * be uninstalled once the provider is sending.
 */
export function claimedDelivery(now: Date = new Date()): MailDelivery {
  return {
    state: 'PROCESSING',
    attempts: 0,
    startTime: now,
    leaseExpireTime: new Date(now.getTime() + CLAIM_LEASE_MS),
    provider: 'resend',
  };
}

export type SendResult = { messageId: string; attempts: number };

/**
 * POST one email to Resend, retrying a rate limit or an upstream fault.
 * Throws with the provider's own message so the failure is recorded verbatim.
 */
export async function sendViaResend(
  payload: ResendPayload,
  apiKey: string,
  fetchImpl: typeof fetch = fetch
): Promise<SendResult> {
  let lastError = 'send was never attempted';

  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt++) {
    let response: Response;
    try {
      response = await fetchImpl(RESEND_ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // A network fault: no response to inspect, so always worth a retry.
      lastError = e instanceof Error ? e.message : String(e);
      if (attempt < MAX_SEND_ATTEMPTS) await sleep(retryDelayMs(null, attempt));
      continue;
    }

    if (response.ok) {
      const body = (await response.json().catch(() => ({}))) as { id?: string };
      return { messageId: body.id ?? '', attempts: attempt };
    }

    const detail = await response.text().catch(() => '');
    lastError = `${response.status} ${response.statusText}${detail ? `: ${detail.slice(0, 500)}` : ''}`;

    if (!isRetryableStatus(response.status) || attempt === MAX_SEND_ATTEMPTS) break;
    await sleep(retryDelayMs(response.headers.get('retry-after'), attempt));
  }

  throw new Error(lastError);
}

/**
 * Send a document that is already in the outbox, and record the outcome on it.
 *
 * Never throws: the callers are a payment webhook and an admin dashboard, and a
 * failure recorded in `delivery` is visible in the Email Log, which is more use
 * than an exception. Under the `extension` transport this does nothing and the
 * extension picks the document up as before.
 */
export async function dispatchQueuedMail(
  db: AdminFirestore,
  mailId: string,
  doc: Partial<MailDoc>,
  env: TransportEnv = process.env as TransportEnv
): Promise<MailTransport> {
  const transport = resolveTransport(env);
  if (transport === 'extension') return transport;

  const startTime = new Date();
  const delivery: MailDelivery = {
    state: 'ERROR',
    attempts: 0,
    startTime,
    endTime: startTime,
    provider: 'resend',
  };

  try {
    const from = resolveFromAddress({ envFrom: env.EMAIL_FROM, docFrom: doc.from });
    if (!from) {
      throw new Error(
        'No sender address configured. Set EMAIL_FROM to an address on a domain verified in Resend.'
      );
    }

    const result = await sendViaResend(toResendPayload(doc, from), (env.RESEND_API_KEY ?? '').trim());
    delivery.state = 'SUCCESS';
    delivery.attempts = result.attempts;
    delivery.endTime = new Date();
    delivery.error = null;
    delivery.info = { messageId: result.messageId, accepted: asList(doc.to) };
  } catch (e) {
    delivery.state = 'ERROR';
    delivery.attempts = Math.max(1, delivery.attempts ?? 0);
    delivery.endTime = new Date();
    delivery.error = e instanceof Error ? e.message : String(e);
    console.error(`Email transport: resend send failed for mail/${mailId}:`, delivery.error);
  }

  try {
    await db.collection('mail').doc(mailId).set({ delivery }, { merge: true });
  } catch (e) {
    console.error(`Email transport: could not record delivery on mail/${mailId}:`, e);
  }

  return transport;
}
