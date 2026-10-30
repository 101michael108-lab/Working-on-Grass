/**
 * Turning order data into words a non-technical shop owner can act on.
 *
 * The dashboard's vocabulary came from the code rather than from the business:
 * an order is "Processing", its email is "queued", a mail document is
 * "unresolved". None of that tells the person packing boxes what to do next.
 * Everything here answers one of two questions — what is this, and what do I
 * do about it — in the owner's language, and is kept separate from the page so
 * the wording can be checked by tests.
 */

import type { Order } from '@/lib/types';
import { describeQueuedMail, type MailDoc } from '@/lib/mail-delivery';

export type OrderStatus = Order['status'];

/** The three piles an owner actually sorts orders into. */
export type OrderGroup = 'to-pack' | 'sent' | 'unpaid';

export const ORDER_GROUPS: Array<{
  id: OrderGroup;
  /** Tab label. */
  label: string;
  /** One line explaining what is in this pile. */
  blurb: string;
  statuses: OrderStatus[];
  /** Shown when the pile is empty. */
  empty: string;
}> = [
  {
    id: 'to-pack',
    label: 'To pack',
    blurb: 'Paid for and waiting to be sent. This is your to-do list.',
    statuses: ['Processing'],
    empty: 'Nothing waiting to be packed. Everything paid for has been sent.',
  },
  {
    id: 'sent',
    label: 'Sent',
    blurb: 'Already on their way to the customer, or completed.',
    statuses: ['Shipped', 'Fulfilled', 'Delivered'],
    empty: 'No orders have been marked as sent yet.',
  },
  {
    id: 'unpaid',
    label: 'Not paid',
    blurb:
      'Someone reached the payment page and never completed. These are not sales — nothing was charged and nothing needs packing.',
    statuses: ['Pending', 'Cancelled'],
    empty: 'Nobody has abandoned a checkout. Everyone who started, paid.',
  },
];

export function groupForStatus(status: OrderStatus): OrderGroup {
  const group = ORDER_GROUPS.find((g) => g.statuses.includes(status));
  return group?.id ?? 'unpaid';
}

/** Statuses where money actually changed hands. */
export const PAID_STATUSES: OrderStatus[] = ['Processing', 'Shipped', 'Fulfilled', 'Delivered'];

export function isPaid(status: OrderStatus): boolean {
  return PAID_STATUSES.includes(status);
}

export type StatusDisplay = {
  label: string;
  /** Plain-English explanation, shown on the order itself. */
  help: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
};

/** What an order's status means, in the owner's words rather than the code's. */
export function describeOrderStatus(status: OrderStatus): StatusDisplay {
  switch (status) {
    case 'Processing':
      return {
        label: 'Paid — pack it',
        help: 'The money has come through. Pack this order and send it.',
        variant: 'default',
      };
    case 'Shipped':
      return {
        label: 'On its way',
        help: 'Marked as sent. The customer has been emailed.',
        variant: 'secondary',
      };
    case 'Fulfilled':
      return { label: 'Done', help: 'This order is complete.', variant: 'success' };
    case 'Delivered':
      return { label: 'Delivered', help: 'The customer has received this order.', variant: 'success' };
    case 'Cancelled':
      return {
        label: 'Cancelled',
        help: 'This order was cancelled. Nothing was charged and nothing is owed.',
        variant: 'destructive',
      };
    case 'Pending':
    default:
      return {
        label: 'Not paid',
        help: 'They reached the payment page but never finished. Nothing was charged — this is not a sale.',
        variant: 'outline',
      };
  }
}

/** The single obvious next step, offered as one button instead of a menu. */
export function nextStatusAction(status: OrderStatus): { label: string; next: OrderStatus } | null {
  if (status === 'Processing') return { label: 'Mark as sent', next: 'Shipped' };
  if (status === 'Shipped') return { label: 'Mark as delivered', next: 'Delivered' };
  return null;
}

export type EmailDisplay = {
  label: string;
  variant: StatusDisplay['variant'];
  /** Plain-English detail. */
  help: string;
  /** Whether to offer the "Email this order to me" button. */
  offerResend: boolean;
  /** Whether this should draw the eye. */
  isProblem: boolean;
};

/**
 * Whether the owner was actually told about this order, in plain words.
 *
 * Deliberately says nothing about mail documents or delivery states. The owner
 * needs to know one thing: did this order reach my inbox, and if not, can I get
 * it now.
 */
export function describeOrderEmail(
  order: Pick<Order, 'status' | 'emailStatus'>,
  mailById: Map<string, MailDoc>,
  now: Date = new Date()
): EmailDisplay {
  const emailStatus = order.emailStatus;
  const paid = isPaid(order.status);

  if (!emailStatus?.queuedAt) {
    if (!paid) {
      return {
        label: '—',
        variant: 'outline',
        help: 'No email is sent for an order that was never paid for.',
        offerResend: false,
        isProblem: false,
      };
    }
    return {
      label: 'You were not emailed',
      variant: 'destructive',
      help: 'This order was paid for but no notification went out. Use "Email this to me" to get the details now.',
      offerResend: true,
      isProblem: true,
    };
  }

  // A notification sent by hand is the most recent truth about this order.
  if (emailStatus.resentAdminMailId) {
    const resent = describeQueuedMail(
      emailStatus.resentAdminMailId,
      mailById.get(emailStatus.resentAdminMailId),
      now
    );
    if (!resent.isProblem) {
      return {
        label: 'Sent to you by hand',
        variant: 'success',
        help: 'Someone re-sent this order to you from this page.',
        offerResend: true,
        isProblem: false,
      };
    }
  }

  const admin = describeQueuedMail(emailStatus.adminMailId, mailById.get(emailStatus.adminMailId || ''), now);

  if (admin.label === 'SUCCESS') {
    return {
      label: 'Emailed to you',
      variant: 'success',
      help: 'The order notification was accepted by the mail provider.',
      offerResend: false,
      isProblem: false,
    };
  }

  if (admin.isProblem) {
    return {
      label: 'Email failed',
      variant: 'destructive',
      help: `The notification could not be delivered. ${admin.detail ?? ''}`.trim(),
      offerResend: true,
      isProblem: true,
    };
  }

  return {
    label: 'Sending…',
    variant: 'secondary',
    help: 'The notification has been handed to the mail provider and is on its way.',
    offerResend: false,
    isProblem: false,
  };
}

/** Compact summary of what was bought, for a one-line row. */
export function summariseItems(items: Order['items'] | undefined): string {
  if (!items || items.length === 0) return 'No items';
  const units = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const first = items[0]?.name ?? 'item';
  if (items.length === 1) return `${units} × ${first}`;
  return `${first} + ${items.length - 1} more (${units} items)`;
}

export type OrderTotals = {
  toPack: number;
  /** How many orders were excluded as rehearsals, so the exclusion is visible. */
  testCount: number;
  paidCount: number;
  unpaidCount: number;
  /** Money from paid orders in the last 30 days. */
  revenue30Days: number;
  /** Money from every paid order, so a quiet month is not mistaken for no sales ever. */
  revenueAllTime: number;
  /** When the most recent payment came in, which gives a zero its meaning. */
  lastPaidAt: Date | null;
  /** Days the oldest unpacked order has been waiting, for spotting a stale pile. */
  oldestToPackDays: number | null;
  /** Share of checkouts that were started and never paid for, 0–1. */
  abandonRate: number | null;
  /** Paid orders whose notification never reached the owner. */
  missedNotifications: number;
};

/**
 * The numbers worth putting in front of the owner.
 *
 * `abandonRate` is the one that answers "why is nobody buying": every unpaid
 * order is someone who wanted the product enough to reach the payment page and
 * then did not finish. A high share points at checkout or payment, not at
 * demand.
 */
export function summariseOrders(
  orders: Array<Pick<Order, 'status' | 'totalAmount' | 'orderDate' | 'emailStatus' | 'isTest'>>,
  now: Date = new Date()
): OrderTotals {
  const cutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  let toPack = 0;
  let paidCount = 0;
  let unpaidCount = 0;
  let revenue30Days = 0;
  let revenueAllTime = 0;
  let missedNotifications = 0;
  let lastPaidMs: number | null = null;
  let oldestToPackMs: number | null = null;
  let testCount = 0;
  for (const order of orders) if (order.isTest) testCount++;

  for (const order of orders) {
    // A rehearsal is not a sale, an abandonment, or a missed notification.
    // Counting them makes every figure on the page meaningless.
    if (order.isTest) continue;

    const paid = isPaid(order.status);
    const placed = orderDateMs(order.orderDate);

    if (order.status === 'Processing') {
      toPack++;
      if (placed !== null && (oldestToPackMs === null || placed < oldestToPackMs)) oldestToPackMs = placed;
    }

    if (paid) {
      paidCount++;
      if (!order.emailStatus?.queuedAt) missedNotifications++;
      const amount = Number(order.totalAmount) || 0;
      revenueAllTime += amount;
      if (placed === null || placed >= cutoff) revenue30Days += amount;
      if (placed !== null && (lastPaidMs === null || placed > lastPaidMs)) lastPaidMs = placed;
    } else if (order.status === 'Pending') {
      unpaidCount++;
    }
  }

  const started = paidCount + unpaidCount;
  return {
    toPack,
    testCount,
    paidCount,
    unpaidCount,
    revenue30Days,
    revenueAllTime,
    lastPaidAt: lastPaidMs === null ? null : new Date(lastPaidMs),
    oldestToPackDays:
      oldestToPackMs === null ? null : Math.floor((now.getTime() - oldestToPackMs) / 86_400_000),
    abandonRate: started > 0 ? unpaidCount / started : null,
    missedNotifications,
  };
}

function orderDateMs(value: unknown): number | null {
  if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    try {
      return (value as { toDate: () => Date }).toDate().getTime();
    } catch {
      return null;
    }
  }
  if (value instanceof Date) return value.getTime();
  return null;
}

/**
 * How long an order has been sitting, in whole days.
 *
 * A pile of unpacked orders from months ago is not a to-do list, it is a sign
 * nobody has been marking them off. Showing the age stops the count reading as
 * work that arrived today.
 */
export function daysWaiting(order: Pick<Order, 'orderDate'>, now: Date = new Date()): number | null {
  const placed = orderDateMs(order.orderDate);
  if (placed === null) return null;
  return Math.floor((now.getTime() - placed) / 86_400_000);
}

/** Match an order against what the owner typed in the search box. */
export function matchesSearch(
  order: Pick<Order, 'orderNumber' | 'id' | 'shippingInfo' | 'items'>,
  term: string
): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;

  const shipping = (order.shippingInfo ?? {}) as Record<string, string>;
  const haystack = [
    String(order.orderNumber ?? ''),
    order.id,
    shipping.firstName,
    shipping.lastName,
    `${shipping.firstName ?? ''} ${shipping.lastName ?? ''}`,
    shipping.email,
    shipping.phone,
    shipping.city,
    ...(order.items ?? []).map((i) => i.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(needle);
}
