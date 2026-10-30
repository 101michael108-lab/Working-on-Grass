/**
 * Shared helpers for reading back what the Firebase "Trigger Email" extension
 * did with a queued email.
 *
 * Nothing in this app talks to an SMTP server. `src/services/email-service.ts`
 * writes a document into the `mail` collection and the extension — installed
 * from the Firebase console, so its SMTP URI and DEFAULT_FROM are NOT in this
 * repository — picks the document up and writes a `delivery` map back onto it.
 *
 * These helpers interpret that writeback. The important case they make visible
 * is a document with no `delivery` field at all minutes after it was queued:
 * that means nothing is consuming the collection (the extension is uninstalled,
 * erroring on startup, or watching a different collection name), which no
 * amount of application logging would ever reveal.
 */

/** The states the extension writes to `delivery.state`. */
export type MailDeliveryState = 'PENDING' | 'PROCESSING' | 'RETRY' | 'SUCCESS' | 'ERROR';

/** The map the Trigger Email extension writes back onto each `mail` document. */
export type MailDelivery = {
  state?: MailDeliveryState | string;
  error?: string | null;
  attempts?: number;
  /** When the extension started working on the document. */
  startTime?: unknown;
  /** When the extension finished (successfully or not). */
  endTime?: unknown;
  leaseExpireTime?: unknown;
  /**
   * Which sender produced this result. Absent on documents written by the
   * Trigger Email extension, which does not identify itself.
   */
  provider?: string;
  info?: {
    messageId?: string;
    accepted?: string[];
    rejected?: string[];
    pending?: string[];
    response?: string;
  };
};

/** A document in the `mail` collection, as written by us plus the extension. */
export type MailDoc = {
  id: string;
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  from?: string;
  replyTo?: string;
  /**
   * Written by `queueMail`, not by the extension. The extension only timestamps
   * documents it actually picks up, so this is the only way to know how long a
   * never-collected document has been sitting there.
   */
  queuedAt?: unknown;
  message?: {
    subject?: string;
    html?: string;
    text?: string;
    attachments?: unknown[];
  };
  delivery?: MailDelivery;
};

/**
 * Per-order email record written by `/api/payfast-itn`.
 *
 * `queuedAt` means "the ITN reached the email block" — its absence on a paid
 * order is the signal that PayFast's notification never arrived at all.
 */
export type OrderEmailStatus = {
  queuedAt?: unknown;
  customerMailId?: string | null;
  adminMailId?: string | null;
  customerTo?: string | null;
  adminTo?: string | null;
  /** Set when queueing threw; the order itself was still updated. */
  emailError?: string;
  emailErrorAt?: unknown;
  /**
   * Written before the emails are queued, to stop two notifications arriving
   * together from both sending. Older than `CLAIM_RETRY_AFTER_MS` with no
   * `queuedAt` means an attempt died midway and a retry is allowed.
   */
  claimedAt?: unknown;
  /** The payment-problem alert raised for an order the system refused. */
  alertMailId?: string | null;
  alertAt?: unknown;
  alertReason?: string;
  /** An admin notification re-sent by hand from the orders dashboard. */
  resentAdminMailId?: string | null;
  resentAt?: unknown;
};

/**
 * How long a `mail` document may sit with no `delivery` writeback before we
 * call it abandoned. The extension normally stamps `delivery` within seconds.
 */
export const UNCOLLECTED_AFTER_MINUTES = 5;

type TimestampLike = { toDate: () => Date };
type SecondsLike = { seconds: number };

function hasToDate(value: unknown): value is TimestampLike {
  return typeof (value as TimestampLike | null)?.toDate === 'function';
}

function hasSeconds(value: unknown): value is SecondsLike {
  return typeof (value as SecondsLike | null)?.seconds === 'number';
}

/**
 * Coerce a Firestore Timestamp, a plain `{seconds}` object, a Date, a number or
 * a date string to a Date. Returns null for anything unusable — these values
 * come from documents written by two different SDKs plus an extension, so they
 * are not reliably one shape.
 */
export function toDateish(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (hasToDate(value)) {
    try {
      const d = value.toDate();
      return Number.isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }
  if (hasSeconds(value)) return new Date(value.seconds * 1000);
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** Date + time in the store's locale, or an em dash when there is no value. */
export function formatDateTime(value: unknown): string {
  const date = toDateish(value);
  return date ? date.toLocaleString('en-ZA') : '—';
}

/** "4 minutes ago" style age, used to justify the "never picked up" verdict. */
export function formatAge(value: unknown, now: Date = new Date()): string {
  const date = toDateish(value);
  if (!date) return 'unknown age';
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

/** `to` may be a single address or an array; render it as one string. */
export function mailRecipients(mail: Pick<MailDoc, 'to'>): string {
  const to = mail.to;
  if (Array.isArray(to)) return to.filter(Boolean).join(', ') || '—';
  return to || '—';
}

/**
 * True when the extension has never touched this document and enough time has
 * passed that it never will. A document with neither `queuedAt` nor `delivery`
 * predates the `queuedAt` field, so its age is unknown — but the extension
 * stamps `delivery` within seconds, so an untouched document is abandoned
 * whatever its age.
 */
export function isUncollected(mail: Pick<MailDoc, 'queuedAt' | 'delivery'>, now: Date = new Date()): boolean {
  if (mail.delivery) return false;
  const queued = toDateish(mail.queuedAt);
  if (!queued) return true;
  return now.getTime() - queued.getTime() > UNCOLLECTED_AFTER_MINUTES * 60_000;
}

export type DeliveryBadge = {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  /** One line of plain English for the admin, shown next to or under the badge. */
  detail?: string;
  /** Needs the owner's attention — drives the loud styling and the page alerts. */
  isProblem: boolean;
};

/** Describe one `mail` document's delivery state for display. */
export function describeDelivery(mail: Pick<MailDoc, 'queuedAt' | 'delivery'>, now: Date = new Date()): DeliveryBadge {
  const delivery = mail.delivery;

  if (!delivery) {
    if (isUncollected(mail, now)) {
      return {
        label: 'Never picked up',
        variant: 'destructive',
        detail:
          'Queued ' +
          formatAge(mail.queuedAt, now) +
          ' and the Trigger Email extension has still not written a delivery state. ' +
          'Nothing is consuming the `mail` collection — check the extension is installed, ' +
          'healthy, and watching the "mail" collection.',
        isProblem: true,
      };
    }
    return {
      label: 'Queued',
      variant: 'outline',
      detail: 'Waiting for the Trigger Email extension to pick it up.',
      isProblem: false,
    };
  }

  const state = String(delivery.state || '').toUpperCase();
  switch (state) {
    case 'SUCCESS':
      return {
        label: 'SUCCESS',
        variant: 'success',
        detail: delivery.info?.response || 'Accepted by the SMTP server.',
        isProblem: false,
      };
    case 'ERROR':
      return {
        label: 'ERROR',
        variant: 'destructive',
        detail: delivery.error || 'The extension could not send this email.',
        isProblem: true,
      };
    case 'RETRY':
      return {
        label: 'RETRY',
        variant: 'secondary',
        detail: delivery.error || 'The send failed and will be retried.',
        isProblem: true,
      };
    case 'PROCESSING':
      return { label: 'PROCESSING', variant: 'secondary', detail: 'Being sent right now.', isProblem: false };
    case 'PENDING':
      return { label: 'PENDING', variant: 'secondary', detail: 'Accepted by the extension, not sent yet.', isProblem: false };
    default:
      return {
        label: state || 'UNKNOWN',
        variant: 'outline',
        detail: 'The extension wrote a delivery state this dashboard does not recognise.',
        isProblem: false,
      };
  }
}

/**
 * Describe an email the order says it queued, resolved against the `mail`
 * document it referenced. The three "no document" cases mean different things,
 * so they are distinguished here rather than collapsed into one label.
 */
export function describeQueuedMail(
  mailId: string | null | undefined,
  mail: MailDoc | undefined,
  now: Date = new Date()
): DeliveryBadge {
  if (!mailId) {
    return {
      label: 'Not queued',
      variant: 'destructive',
      detail: 'No mail document was recorded for this email.',
      isProblem: true,
    };
  }
  if (!mail) {
    return {
      label: 'Unresolved',
      variant: 'outline',
      detail: `mail/${mailId} could not be read — it was probably deleted.`,
      isProblem: false,
    };
  }
  return describeDelivery(mail, now);
}

/** The timestamp a `mail` document should be sorted by, newest first. */
export function mailSortTime(mail: MailDoc): number {
  const queued = toDateish(mail.queuedAt);
  if (queued) return queued.getTime();
  const started = toDateish(mail.delivery?.startTime);
  if (started) return started.getTime();
  return toDateish(mail.delivery?.endTime)?.getTime() ?? 0;
}
