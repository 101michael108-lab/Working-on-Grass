import { describe, it, expect } from 'vitest';
import {
  ORDER_GROUPS,
  describeOrderEmail,
  describeOrderStatus,
  groupForStatus,
  isPaid,
  matchesSearch,
  nextStatusAction,
  summariseItems,
  summariseOrders,
} from './order-display';
import type { MailDoc } from './mail-delivery';

const NOW = new Date('2026-03-01T12:00:00Z');
const daysAgo = (n: number) => ({ toDate: () => new Date(NOW.getTime() - n * 86_400_000) });
const noMail = new Map<string, MailDoc>();

describe('order grouping', () => {
  it('puts every status in exactly one pile', () => {
    const statuses = ['Pending', 'Processing', 'Shipped', 'Fulfilled', 'Delivered', 'Cancelled'] as const;
    for (const status of statuses) {
      const matches = ORDER_GROUPS.filter((g) => g.statuses.includes(status));
      expect(matches, status).toHaveLength(1);
      expect(groupForStatus(status)).toBe(matches[0].id);
    }
  });

  it('separates orders that were paid for from checkouts that were abandoned', () => {
    // The distinction the old single list hid: an unpaid order is not a sale.
    expect(groupForStatus('Processing')).toBe('to-pack');
    expect(groupForStatus('Pending')).toBe('unpaid');
    expect(isPaid('Processing')).toBe(true);
    expect(isPaid('Pending')).toBe(false);
    expect(isPaid('Cancelled')).toBe(false);
  });
});

describe('plain-language wording', () => {
  it('says what to do rather than naming an internal state', () => {
    expect(describeOrderStatus('Processing').label).toBe('Paid — pack it');
    expect(describeOrderStatus('Pending').label).toBe('Not paid');
    expect(describeOrderStatus('Pending').help).toMatch(/not a sale/i);
  });

  it('offers one obvious next step, and none where there is no safe default', () => {
    expect(nextStatusAction('Processing')).toEqual({ label: 'Mark as sent', next: 'Shipped' });
    expect(nextStatusAction('Shipped')).toEqual({ label: 'Mark as delivered', next: 'Delivered' });
    // Nothing should offer to mark an unpaid order as paid.
    expect(nextStatusAction('Pending')).toBeNull();
    expect(nextStatusAction('Cancelled')).toBeNull();
  });

  it('summarises a basket in one line', () => {
    expect(summariseItems([{ productId: 'a', name: 'Smuts Finger', quantity: 2, price: 150 }])).toBe(
      '2 × Smuts Finger'
    );
    expect(
      summariseItems([
        { productId: 'a', name: 'Smuts Finger', quantity: 2, price: 150 },
        { productId: 'b', name: 'Eragrostis', quantity: 1, price: 90 },
      ])
    ).toBe('Smuts Finger + 1 more (3 items)');
    expect(summariseItems([])).toBe('No items');
  });
});

describe('describeOrderEmail', () => {
  it('stays quiet about an unpaid order, which is never emailed', () => {
    const email = describeOrderEmail({ status: 'Pending' }, noMail, NOW);
    expect(email.label).toBe('—');
    expect(email.isProblem).toBe(false);
    expect(email.offerResend).toBe(false);
  });

  it('raises a paid order the owner was never told about, and offers the fix', () => {
    const email = describeOrderEmail({ status: 'Processing' }, noMail, NOW);
    expect(email.label).toBe('You were not emailed');
    expect(email.isProblem).toBe(true);
    expect(email.offerResend).toBe(true);
  });

  it('confirms a delivered notification without jargon', () => {
    const mail = new Map<string, MailDoc>([['m1', { id: 'm1', delivery: { state: 'SUCCESS' } }]]);
    const email = describeOrderEmail(
      { status: 'Processing', emailStatus: { queuedAt: NOW, adminMailId: 'm1' } },
      mail,
      NOW
    );
    expect(email.label).toBe('Emailed to you');
    expect(email.isProblem).toBe(false);
  });

  it('reports a rejected notification as a failure the owner can act on', () => {
    const mail = new Map<string, MailDoc>([
      ['m1', { id: 'm1', delivery: { state: 'ERROR', error: '550 mailbox full' } }],
    ]);
    const email = describeOrderEmail(
      { status: 'Processing', emailStatus: { queuedAt: NOW, adminMailId: 'm1' } },
      mail,
      NOW
    );
    expect(email.label).toBe('Email failed');
    expect(email.offerResend).toBe(true);
    expect(email.help).toContain('550 mailbox full');
  });

  it('prefers a successful hand-sent notification over an earlier failure', () => {
    const mail = new Map<string, MailDoc>([
      ['m1', { id: 'm1', delivery: { state: 'ERROR', error: 'nope' } }],
      ['m2', { id: 'm2', delivery: { state: 'SUCCESS' } }],
    ]);
    const email = describeOrderEmail(
      { status: 'Processing', emailStatus: { queuedAt: NOW, adminMailId: 'm1', resentAdminMailId: 'm2' } },
      mail,
      NOW
    );
    expect(email.label).toBe('Sent to you by hand');
    expect(email.isProblem).toBe(false);
  });
});

describe('summariseOrders', () => {
  const orders = [
    { status: 'Processing' as const, totalAmount: 450, orderDate: daysAgo(2), emailStatus: { queuedAt: NOW } },
    { status: 'Shipped' as const, totalAmount: 300, orderDate: daysAgo(10), emailStatus: { queuedAt: NOW } },
    // Paid but never announced — the failure the dashboard must surface.
    { status: 'Delivered' as const, totalAmount: 200, orderDate: daysAgo(40), emailStatus: undefined },
    { status: 'Pending' as const, totalAmount: 999, orderDate: daysAgo(1), emailStatus: undefined },
    { status: 'Pending' as const, totalAmount: 999, orderDate: daysAgo(3), emailStatus: undefined },
  ];

  it('counts the work, the money and the misses', () => {
    const t = summariseOrders(orders, NOW);
    expect(t.toPack).toBe(1);
    expect(t.paidCount).toBe(3);
    expect(t.unpaidCount).toBe(2);
    expect(t.missedNotifications).toBe(1);
  });

  it('counts revenue from paid orders in the last 30 days only', () => {
    // 450 + 300; the 40-day-old 200 falls outside, and unpaid 999s never count.
    expect(summariseOrders(orders, NOW).revenue30Days).toBe(750);
  });

  it('reports the share of checkouts that were started and abandoned', () => {
    // 2 unpaid of 5 started.
    expect(summariseOrders(orders, NOW).abandonRate).toBeCloseTo(0.4);
    expect(summariseOrders([], NOW).abandonRate).toBeNull();
  });
});

describe('matchesSearch', () => {
  const order = {
    orderNumber: 1001,
    id: 'abc123',
    shippingInfo: { firstName: 'Thandi', lastName: 'Mokoena', email: 't@farm.co.za', city: 'Modimolle' },
    items: [{ productId: 'p', name: 'Smuts Finger', quantity: 1, price: 150 }],
  };

  it('finds an order the way an owner would look for it', () => {
    expect(matchesSearch(order, '1001')).toBe(true);
    expect(matchesSearch(order, 'thandi')).toBe(true);
    expect(matchesSearch(order, 'Thandi Mokoena')).toBe(true);
    expect(matchesSearch(order, 'modimolle')).toBe(true);
    expect(matchesSearch(order, 'smuts')).toBe(true);
    expect(matchesSearch(order, 't@farm.co.za')).toBe(true);
  });

  it('matches everything on an empty box and nothing on a miss', () => {
    expect(matchesSearch(order, '  ')).toBe(true);
    expect(matchesSearch(order, 'eragrostis')).toBe(false);
  });
});
