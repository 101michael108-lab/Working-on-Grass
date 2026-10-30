import { describe, it, expect } from 'vitest';
import {
  UNCOLLECTED_AFTER_MINUTES,
  describeDelivery,
  describeQueuedMail,
  isUncollected,
  mailRecipients,
  mailSortTime,
  toDateish,
} from './mail-delivery';

const NOW = new Date('2026-03-01T12:00:00Z');
const minutesAgo = (n: number) => new Date(NOW.getTime() - n * 60_000);

describe('mail-delivery', () => {
  it('reads timestamps from every shape the mail collection holds', () => {
    const expected = new Date('2026-03-01T11:55:00Z');
    expect(toDateish(expected)).toEqual(expected);
    expect(toDateish({ toDate: () => expected })).toEqual(expected);
    expect(toDateish({ seconds: expected.getTime() / 1000, nanoseconds: 0 })).toEqual(expected);
    expect(toDateish('2026-03-01T11:55:00Z')).toEqual(expected);
    expect(toDateish(undefined)).toBeNull();
    expect(toDateish('not a date')).toBeNull();
  });

  it('treats a doc with no delivery writeback as abandoned only once it is stale', () => {
    expect(isUncollected({ queuedAt: minutesAgo(1) }, NOW)).toBe(false);
    expect(isUncollected({ queuedAt: minutesAgo(UNCOLLECTED_AFTER_MINUTES + 1) }, NOW)).toBe(true);
    // Pre-existing docs have no queuedAt, so their age is unknown — but the
    // extension stamps `delivery` within seconds, so an untouched doc is dead.
    expect(isUncollected({}, NOW)).toBe(true);
    // A doc the extension picked up is never "uncollected", whatever it says.
    expect(isUncollected({ delivery: { state: 'ERROR' } }, NOW)).toBe(false);
  });

  it('flags a never-collected doc as a problem and a fresh one as merely queued', () => {
    const stale = describeDelivery({ queuedAt: minutesAgo(30) }, NOW);
    expect(stale.label).toBe('Never picked up');
    expect(stale.isProblem).toBe(true);

    const fresh = describeDelivery({ queuedAt: minutesAgo(1) }, NOW);
    expect(fresh.label).toBe('Queued');
    expect(fresh.isProblem).toBe(false);
  });

  it('surfaces the extension error text for a rejected send', () => {
    const badge = describeDelivery(
      { queuedAt: minutesAgo(10), delivery: { state: 'ERROR', error: '550 sender rejected', attempts: 1 } },
      NOW
    );
    expect(badge.label).toBe('ERROR');
    expect(badge.variant).toBe('destructive');
    expect(badge.detail).toBe('550 sender rejected');
    expect(badge.isProblem).toBe(true);
  });

  it('does not flag a successful or in-flight send', () => {
    expect(describeDelivery({ delivery: { state: 'SUCCESS' } }, NOW).isProblem).toBe(false);
    expect(describeDelivery({ delivery: { state: 'SUCCESS' } }, NOW).variant).toBe('success');
    expect(describeDelivery({ delivery: { state: 'PROCESSING' } }, NOW).isProblem).toBe(false);
    expect(describeDelivery({ delivery: { state: 'PENDING' } }, NOW).isProblem).toBe(false);
  });

  it('distinguishes "never queued" from "queued but unresolvable"', () => {
    expect(describeQueuedMail(null, undefined, NOW).label).toBe('Not queued');
    expect(describeQueuedMail(null, undefined, NOW).isProblem).toBe(true);

    const orphan = describeQueuedMail('abc123', undefined, NOW);
    expect(orphan.label).toBe('Unresolved');
    expect(orphan.isProblem).toBe(false);

    expect(describeQueuedMail('abc123', { id: 'abc123', delivery: { state: 'SUCCESS' } }, NOW).label).toBe('SUCCESS');
  });

  it('sorts by queuedAt, falling back to the extension timestamps', () => {
    const queued = mailSortTime({ id: 'a', queuedAt: minutesAgo(5), delivery: { startTime: minutesAgo(99) } });
    expect(queued).toBe(minutesAgo(5).getTime());
    expect(mailSortTime({ id: 'b', delivery: { startTime: minutesAgo(7) } })).toBe(minutesAgo(7).getTime());
    expect(mailSortTime({ id: 'c', delivery: { endTime: minutesAgo(9) } })).toBe(minutesAgo(9).getTime());
    expect(mailSortTime({ id: 'd' })).toBe(0);
  });

  it('renders single and multiple recipients', () => {
    expect(mailRecipients({ to: 'admin@workingongrass.co.za' })).toBe('admin@workingongrass.co.za');
    expect(mailRecipients({ to: ['a@b.co', 'c@d.co'] })).toBe('a@b.co, c@d.co');
    expect(mailRecipients({ to: undefined })).toBe('—');
  });
});
