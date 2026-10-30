import { describe, it, expect } from 'vitest';
import {
  FUNNEL_STEPS,
  biggestDropOff,
  buildFunnel,
  explainDropOff,
  funnelDayId,
  isFunnelEvent,
  recentDayIds,
  sumDays,
} from './funnel';

describe('event allowlist', () => {
  it('accepts only the events the funnel knows about', () => {
    // The tracking endpoint is public, so this list is what stops a stranger
    // writing arbitrary fields into the owner's figures.
    expect(isFunnelEvent('add_to_cart')).toBe(true);
    expect(isFunnelEvent('payment_confirmed')).toBe(true);
    expect(isFunnelEvent('checkout_failed')).toBe(true);
    expect(isFunnelEvent('__proto__')).toBe(false);
    expect(isFunnelEvent('anything_else')).toBe(false);
    expect(isFunnelEvent(42)).toBe(false);
    expect(isFunnelEvent(undefined)).toBe(false);
  });
});

describe('buildFunnel', () => {
  const counts = {
    view_item: 200,
    add_to_cart: 50,
    begin_checkout: 20,
    payment_started: 16,
    payment_confirmed: 4,
  };

  it('works out what share of each step reaches the next', () => {
    const rows = buildFunnel(counts);
    expect(rows.map((r) => r.id)).toEqual(FUNNEL_STEPS.map((s) => s.id));

    expect(rows[0].fromPrevious).toBeNull();
    expect(rows[1].fromPrevious).toBeCloseTo(0.25);
    expect(rows[2].fromPrevious).toBeCloseTo(0.4);
    expect(rows[4].fromPrevious).toBeCloseTo(0.25);
  });

  it('counts how many were lost at each step', () => {
    const rows = buildFunnel(counts);
    expect(rows[1].lost).toBe(150);
    expect(rows[4].lost).toBe(12);
  });

  it('measures each step against the top of the funnel too', () => {
    const rows = buildFunnel(counts);
    expect(rows[4].fromTop).toBeCloseTo(0.02);
  });

  it('survives missing and empty data without dividing by zero', () => {
    const rows = buildFunnel({});
    expect(rows).toHaveLength(FUNNEL_STEPS.length);
    expect(rows.every((r) => r.count === 0)).toBe(true);
    expect(rows[1].fromPrevious).toBeNull();
    expect(rows[1].lost).toBe(0);
  });

  it('does not report a negative loss when a later step somehow exceeds an earlier one', () => {
    // Possible in a window where a payment confirms for an order started
    // before the period began.
    const rows = buildFunnel({ view_item: 1, add_to_cart: 5 });
    expect(rows[1].lost).toBe(0);
  });
});

describe('biggestDropOff', () => {
  it('picks the step that loses the most people, not the worst percentage', () => {
    // 150 lost at a 75% drop beats 3 lost at a 100% drop: effort should go
    // where the volume is.
    const rows = buildFunnel({
      view_item: 200,
      add_to_cart: 50,
      begin_checkout: 20,
      payment_started: 17,
      payment_confirmed: 0,
    });
    expect(biggestDropOff(rows)?.id).toBe('add_to_cart');
  });

  it('ignores steps with too little traffic to mean anything', () => {
    const rows = buildFunnel({ view_item: 3, add_to_cart: 0 });
    expect(biggestDropOff(rows)).toBeNull();
  });

  it('reports nothing when nobody is lost', () => {
    const rows = buildFunnel({
      view_item: 10,
      add_to_cart: 10,
      begin_checkout: 10,
      payment_started: 10,
      payment_confirmed: 10,
    });
    expect(biggestDropOff(rows)).toBeNull();
  });

  it('explains every step it can name as the worst', () => {
    for (const step of FUNNEL_STEPS.slice(1)) {
      expect(explainDropOff(step.id).length).toBeGreaterThan(20);
    }
  });
});

describe('sumDays', () => {
  it('adds the days together and ignores anything unrecognised', () => {
    const { counts, failures } = sumDays([
      { date: '2026-10-29', counts: { view_item: 5, add_to_cart: 2 }, failures: { out_of_stock: 1 } },
      { date: '2026-10-30', counts: { view_item: 3, payment_confirmed: 1 }, failures: { out_of_stock: 2 } },
      // A stray field must not become a funnel step.
      { date: '2026-10-28', counts: { nonsense: 99 } as never },
    ]);

    expect(counts.view_item).toBe(8);
    expect(counts.add_to_cart).toBe(2);
    expect(counts.payment_confirmed).toBe(1);
    expect((counts as Record<string, number>).nonsense).toBeUndefined();
    expect(failures.out_of_stock).toBe(3);
  });

  it('handles days with no data at all', () => {
    expect(sumDays([{ date: '2026-10-30' }]).counts).toEqual({});
    expect(sumDays([]).failures).toEqual({});
  });
});

describe('day ids', () => {
  it('names a day by its UTC date', () => {
    expect(funnelDayId(new Date('2026-10-30T23:30:00Z'))).toBe('2026-10-30');
  });

  it('lists recent days newest first, without gaps', () => {
    const ids = recentDayIds(3, new Date('2026-10-30T12:00:00Z'));
    expect(ids).toEqual(['2026-10-30', '2026-10-29', '2026-10-28']);
  });
});
