import { describe, it, expect } from 'vitest';
import { CLAIM_RETRY_AFTER_MS, decideEmailClaim } from './order-notifications';

const NOW = new Date('2026-03-01T12:00:00Z');
const agoMs = (ms: number) => new Date(NOW.getTime() - ms);

describe('order-notifications claim', () => {
  it('queues emails for an order that has never had any', () => {
    expect(decideEmailClaim(undefined, NOW)).toBe('claim');
    expect(decideEmailClaim({}, NOW)).toBe('claim');
  });

  it('never queues twice for an order that completed an attempt', () => {
    expect(decideEmailClaim({ queuedAt: agoMs(1000) }, NOW)).toBe('already-queued');
    // Even when that attempt partly failed — the failure is recorded for the
    // dashboard, and a duplicate sales email is not the remedy.
    expect(
      decideEmailClaim({ queuedAt: agoMs(1000), adminMailId: 'a1', customerMailId: null, emailError: 'boom' }, NOW)
    ).toBe('already-queued');
  });

  it('holds off while another notification is mid-flight', () => {
    expect(decideEmailClaim({ claimedAt: agoMs(5_000) }, NOW)).toBe('in-flight');
    expect(decideEmailClaim({ claimedAt: agoMs(CLAIM_RETRY_AFTER_MS - 1_000) }, NOW)).toBe('in-flight');
  });

  it('lets a later notification retry a claim that died midway', () => {
    // This is the fix for emails being lost forever when the first attempt
    // crashed between claiming the work and queueing the mail.
    expect(decideEmailClaim({ claimedAt: agoMs(CLAIM_RETRY_AFTER_MS + 1_000) }, NOW)).toBe('claim');
  });

  it('prefers the completed marker over a stale claim', () => {
    expect(
      decideEmailClaim({ claimedAt: agoMs(CLAIM_RETRY_AFTER_MS + 1_000), queuedAt: agoMs(1_000) }, NOW)
    ).toBe('already-queued');
  });

  it('reads a claim written as a Firestore timestamp, not just a Date', () => {
    const stamp = agoMs(5_000);
    expect(decideEmailClaim({ claimedAt: { toDate: () => stamp } }, NOW)).toBe('in-flight');
  });
});

/**
 * A stand-in for the Admin SDK surface `ensureOrderNotifications` touches, so
 * the queueing behaviour can be exercised without Firestore. `queueMail`
 * chooses the Admin path by duck-typing `.collection`, which is reproduced here.
 */
function fakeFirestore(options: { failSubjectPrefix?: string } = {}) {
  const queued: Array<Record<string, any>> = [];
  const orderWrites: Array<Record<string, any>> = [];
  let order: Record<string, any> = {
    orderNumber: 1001,
    totalAmount: 450,
    status: 'Processing',
    items: [{ productId: 'p1', name: 'Smuts Finger', quantity: 2, price: 150 }],
    shippingInfo: { email: 'buyer@example.com', firstName: 'Thandi', lastName: 'Mokoena' },
  };
  let mailSeq = 0;

  const db: any = {
    collection: (name: string) => {
      if (name !== 'mail') throw new Error(`unexpected collection ${name}`);
      return {
        add: async (data: Record<string, any>) => {
          const subject = String(data?.message?.subject ?? '');
          if (options.failSubjectPrefix && subject.startsWith(options.failSubjectPrefix)) {
            throw new Error('SMTP relay refused the recipient');
          }
          queued.push(data);
          return { id: `mail_${++mailSeq}` };
        },
      };
    },
    runTransaction: async (fn: (tx: any) => Promise<unknown>) =>
      fn({
        get: async () => ({ exists: true, data: () => order }),
        set: (_ref: unknown, data: Record<string, any>) => {
          order = { ...order, emailStatus: { ...(order.emailStatus ?? {}), ...data.emailStatus } };
        },
      }),
  };

  const orderRef: any = {
    firestore: db,
    set: async (data: Record<string, any>) => {
      orderWrites.push(data);
      order = { ...order, emailStatus: { ...(order.emailStatus ?? {}), ...data.emailStatus } };
    },
  };

  return {
    orderRef,
    queued,
    orderWrites,
    getOrder: () => order,
    setOrder: (patch: Record<string, any>) => {
      order = { ...order, ...patch };
    },
    subjects: () => queued.map((d) => String(d?.message?.subject ?? '')),
  };
}

async function run(fake: ReturnType<typeof fakeFirestore>, settings: any = { storeName: 'Working on Grass' }) {
  const { ensureOrderNotifications } = await import('./order-notifications');
  return ensureOrderNotifications({
    orderRef: fake.orderRef,
    order: fake.getOrder(),
    orderId: 'order123',
    settings,
  });
}

describe('ensureOrderNotifications', () => {
  it('queues both emails and records their ids on the order', async () => {
    const fake = fakeFirestore();
    const result = await run(fake);

    expect(result.outcome).toBe('queued');
    expect(result.errors).toEqual([]);
    expect(fake.subjects()).toEqual([
      'Order Confirmation #1001 | Working on Grass',
      '[SALES] New Order #1001 - Thandi Mokoena',
    ]);

    const recorded = fake.getOrder().emailStatus;
    expect(recorded.customerMailId).toBe(result.customerMailId);
    expect(recorded.adminMailId).toBe(result.adminMailId);
    expect(recorded.queuedAt).toBeInstanceOf(Date);
    expect(recorded.adminTo).toBe('admin@workingongrass.co.za');
    expect(recorded.customerTo).toBe('buyer@example.com');
  });

  it('still sends the sales notification when the customer email fails', async () => {
    // The defect this guards: both emails shared one try/catch with the
    // customer receipt awaited first, so one bad address lost the sale alert.
    const fake = fakeFirestore({ failSubjectPrefix: 'Order Confirmation' });
    const result = await run(fake);

    expect(fake.subjects()).toEqual(['[SALES] New Order #1001 - Thandi Mokoena']);
    expect(result.adminMailId).not.toBeNull();
    expect(result.customerMailId).toBeNull();
    expect(result.errors).toHaveLength(1);
    expect(fake.getOrder().emailStatus.emailError).toContain('customer confirmation');
  });

  it('still sends the sales notification when the order has no customer address', async () => {
    const fake = fakeFirestore();
    fake.setOrder({ shippingInfo: { firstName: 'Thandi', lastName: 'Mokoena' } });
    const result = await run(fake);

    expect(fake.subjects()).toEqual(['[SALES] New Order #1001 - Thandi Mokoena']);
    expect(result.adminMailId).not.toBeNull();
    expect(result.customerMailId).toBeNull();
  });

  it('notifies every configured admin recipient', async () => {
    const fake = fakeFirestore();
    await run(fake, { storeName: 'Working on Grass', contactEmail: 'owner@farm.co.za, sales@farm.co.za' });

    const adminMail = fake.queued.find((d) => String(d.message.subject).startsWith('[SALES]'));
    expect(adminMail?.to).toEqual(['owner@farm.co.za', 'sales@farm.co.za']);
  });

  it('omits a `from` header when the configured sender is not an address', async () => {
    const fake = fakeFirestore();
    await run(fake, { storeName: 'Working on Grass', senderEmail: 'Working on Grass' });
    expect(fake.queued.every((d) => d.from === undefined)).toBe(true);

    const ok = fakeFirestore();
    await run(ok, { storeName: 'Working on Grass', senderEmail: 'sales@farm.co.za' });
    expect(ok.queued[0].from).toBe('Working on Grass <sales@farm.co.za>');
  });

  it('does not re-queue when a previous attempt already completed', async () => {
    const fake = fakeFirestore();
    fake.setOrder({ emailStatus: { queuedAt: new Date('2026-02-01T00:00:00Z') } });
    const result = await run(fake);

    expect(result.outcome).toBe('already-queued');
    expect(fake.queued).toHaveLength(0);
  });

  it('does not re-queue while another notification holds a fresh claim', async () => {
    const fake = fakeFirestore();
    fake.setOrder({ emailStatus: { claimedAt: new Date() } });
    const result = await run(fake);

    expect(result.outcome).toBe('in-flight');
    expect(fake.queued).toHaveLength(0);
  });

  it('retries a claim left behind by an attempt that died', async () => {
    const fake = fakeFirestore();
    fake.setOrder({ emailStatus: { claimedAt: new Date(Date.now() - CLAIM_RETRY_AFTER_MS - 1_000) } });
    const result = await run(fake);

    expect(result.outcome).toBe('queued');
    expect(fake.subjects()).toHaveLength(2);
  });
});
