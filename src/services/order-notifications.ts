/**
 * Making sure a paid order's notifications actually get queued.
 *
 * This used to live inline in the PayFast ITN route, welded to the status
 * transition, and it lost emails in three ways:
 *
 *  1. Emails were queued only inside the one transaction that moved an order
 *     from `Pending` to `Processing`. Anything else that moved the status first
 *     — an admin using the dropdown, a race between two notifications — meant
 *     the order was never announced, with no retry and no record.
 *  2. The route returned early for an order that was already processed, so a
 *     repeat notification from PayFast could not heal a first attempt whose
 *     emails had failed.
 *  3. Both emails shared one try/catch with the customer receipt awaited first,
 *     so a bad customer address or a rejected attachment silently took the
 *     sales notification down with it.
 *
 * Queueing is therefore claimed on the order document itself rather than
 * inferred from its status, and the two emails are queued independently.
 */

import type { DocumentData, DocumentReference } from 'firebase-admin/firestore';
import {
  sendAdminOrderNotification,
  sendAdminPaymentProblemNotification,
  sendOrderConfirmationEmail,
} from '@/services/email-service';
import { resolveAdminRecipients, resolveSenderEmail } from '@/lib/email-recipients';
import { toDateish, type OrderEmailStatus } from '@/lib/mail-delivery';
import type { SiteSettings } from '@/lib/types';

/**
 * How long a claim is trusted before another notification may retry it. A claim
 * is written before the emails are queued, so a process that dies in between
 * would otherwise block its own order forever. PayFast retries notifications
 * for far longer than this, which is what makes the retry useful.
 */
export const CLAIM_RETRY_AFTER_MS = 10 * 60 * 1000;

export type ClaimDecision = 'claim' | 'already-queued' | 'in-flight';

export type EnsureNotificationsResult = {
  outcome: 'queued' | 'already-queued' | 'in-flight';
  customerMailId: string | null;
  adminMailId: string | null;
  /** One entry per email that could not be queued. Empty on full success. */
  errors: string[];
};

/**
 * Whether this call should queue an order's emails, given what the order
 * already records. Pure, so the once-only rule is testable without Firestore.
 *
 * `queuedAt` is written only after a complete attempt, so its presence is the
 * authoritative "this order has been handled". `claimedAt` is written before
 * the attempt and only holds other callers off for as long as an attempt could
 * plausibly still be running.
 */
export function decideEmailClaim(
  status: OrderEmailStatus | undefined,
  now: Date = new Date()
): ClaimDecision {
  if (status?.queuedAt) return 'already-queued';

  const claimed = toDateish(status?.claimedAt);
  if (claimed && now.getTime() - claimed.getTime() < CLAIM_RETRY_AFTER_MS) return 'in-flight';

  return 'claim';
}

/**
 * Take the claim transactionally, so two notifications arriving together cannot
 * both decide to send.
 */
async function claimEmailWork(orderRef: DocumentReference): Promise<ClaimDecision> {
  return orderRef.firestore.runTransaction(async (tx) => {
    const snap = await tx.get(orderRef);
    if (!snap.exists) return 'already-queued';

    const decision = decideEmailClaim(snap.data()?.emailStatus as OrderEmailStatus | undefined);
    if (decision !== 'claim') return decision;

    tx.set(orderRef, { emailStatus: { claimedAt: new Date() } }, { merge: true });
    return decision;
  });
}

type QueueAttempt = { id: string | null; error?: string };

/** Queue one email, converting any failure into a recorded error. */
async function attemptQueue(
  label: string,
  run: () => Promise<{ id: string } | undefined>
): Promise<QueueAttempt> {
  try {
    const ref = await run();
    return { id: ref?.id ?? null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`Order notifications: ${label} could not be queued:`, e);
    return { id: null, error: `${label}: ${message}` };
  }
}

/**
 * Queue the customer receipt and the admin sales notification for a paid order,
 * at most once per order, and record the result on the order document.
 *
 * Never throws: the caller is a payment webhook that must acknowledge the
 * notification regardless, and a failure recorded on the order is visible in
 * the admin dashboard.
 */
export async function ensureOrderNotifications(opts: {
  orderRef: DocumentReference;
  order: DocumentData;
  orderId: string;
  settings: SiteSettings | null;
  /** Prepared by the caller, which owns invoice-token signing. */
  invoiceUrl?: string;
  invoiceFileName?: string;
  extraAttachments?: Array<{ filename: string; path: string }>;
}): Promise<EnsureNotificationsResult> {
  const { orderRef, order, orderId, settings } = opts;
  const db = orderRef.firestore;

  let claim: ClaimDecision;
  try {
    claim = await claimEmailWork(orderRef);
  } catch (e) {
    console.error('Order notifications: could not claim the email work:', e);
    // Better to risk a duplicate than to drop the only notification of a sale.
    claim = 'claim';
  }

  if (claim !== 'claim') {
    return { outcome: claim, customerMailId: null, adminMailId: null, errors: [] };
  }

  const adminRecipients = resolveAdminRecipients(settings);
  const fromEmail = resolveSenderEmail(settings);
  const shipping = (order.shippingInfo ?? {}) as Record<string, string>;
  const customerTo = shipping.email || null;
  const customerName = `${shipping.firstName ?? ''} ${shipping.lastName ?? ''}`.trim() || 'Customer';

  const shared = {
    orderId,
    orderNumber: order.orderNumber as number | undefined,
    orderDate: new Date(),
    customerName,
    totalAmount: Number(order.totalAmount ?? 0),
    items: (order.items ?? []) as Array<{ name: string; quantity: number; price: number }>,
    shippingInfo: order.shippingInfo,
    storeName: settings?.storeName,
    fromEmail,
  };

  // Queued in parallel and caught separately. The sales notification is the one
  // the business cannot do without, so nothing about the customer receipt —
  // a mistyped address, an attachment URL that no longer resolves — is allowed
  // to prevent it.
  const [customer, admin] = await Promise.all([
    attemptQueue('customer confirmation', () =>
      sendOrderConfirmationEmail(
        {
          ...shared,
          to: customerTo ?? '',
          billingInfo: order.billingInfo,
          invoiceUrl: opts.invoiceUrl,
          invoiceFileName: opts.invoiceFileName,
          extraAttachments: opts.extraAttachments,
        },
        db
      )
    ),
    attemptQueue('admin notification', () =>
      sendAdminOrderNotification({ ...shared, to: adminRecipients }, db)
    ),
  ]);

  const errors = [customer.error, admin.error].filter((e): e is string => !!e);

  const record: OrderEmailStatus = {
    queuedAt: new Date(),
    customerMailId: customer.id,
    adminMailId: admin.id,
    customerTo,
    adminTo: adminRecipients.join(', '),
    ...(errors.length > 0 ? { emailError: errors.join(' | '), emailErrorAt: new Date() } : {}),
  };

  try {
    await orderRef.set({ emailStatus: record }, { merge: true });
  } catch (e) {
    // The emails are already queued; only the record failed. `queuedAt` stays
    // unset, so a later retry may duplicate them — the lesser of the two evils.
    console.error('Order notifications: could not record the result on the order:', e);
  }

  return { outcome: 'queued', customerMailId: customer.id, adminMailId: admin.id, errors };
}

/**
 * Alert the admin about a payment the system would not act on.
 *
 * A notification whose amount does not match the server-priced total gets the
 * order cancelled. Money may have moved, so a human has to look at it — this
 * path used to produce nothing but a line in the server log.
 */
export async function notifyAdminOfPaymentProblem(opts: {
  orderRef: DocumentReference;
  order: DocumentData;
  orderId: string;
  settings: SiteSettings | null;
  problem: string;
  actionTaken: string;
  paymentStatus?: string;
  amountPaid?: number;
}): Promise<void> {
  const { orderRef, order, orderId, settings } = opts;
  const shipping = (order.shippingInfo ?? {}) as Record<string, string>;

  try {
    const alert = await sendAdminPaymentProblemNotification(
      {
        to: resolveAdminRecipients(settings),
        orderId,
        orderNumber: order.orderNumber as number | undefined,
        customerName: `${shipping.firstName ?? ''} ${shipping.lastName ?? ''}`.trim() || 'Customer',
        customerEmail: shipping.email,
        paymentStatus: opts.paymentStatus,
        amountPaid: opts.amountPaid,
        expectedAmount: Number(order.totalAmount ?? 0),
        problem: opts.problem,
        actionTaken: opts.actionTaken,
        storeName: settings?.storeName,
        fromEmail: resolveSenderEmail(settings),
      },
      orderRef.firestore
    );

    await orderRef.set(
      { emailStatus: { alertMailId: alert?.id ?? null, alertAt: new Date(), alertReason: opts.problem } },
      { merge: true }
    );
  } catch (e) {
    console.error('Order notifications: could not queue the payment-problem alert:', e);
  }
}
