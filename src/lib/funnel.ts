/**
 * The buying funnel: how far people get, and where they give up.
 *
 * GA4 already receives these events, but nobody running this business is going
 * to open GA4. So the same steps are counted into a small daily tally the admin
 * dashboard can read, and turned into sentences that say what a drop probably
 * means and what to look at.
 *
 * Counts are totals, not unique people: one visitor who looks at three products
 * counts three times at the first step. That makes the first step's absolute
 * number meaningless on its own, and the step-to-step percentages the thing
 * worth reading.
 */

/** Every event the public endpoint will accept. Anything else is rejected. */
export const FUNNEL_EVENTS = [
  'view_item',
  'add_to_cart',
  'view_cart',
  'begin_checkout',
  'payment_started',
  'payment_confirmed',
  'checkout_failed',
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

export function isFunnelEvent(value: unknown): value is FunnelEvent {
  return typeof value === 'string' && (FUNNEL_EVENTS as readonly string[]).includes(value);
}

/** The ordered steps shown as a funnel. `view_cart` is tracked but not a step. */
export const FUNNEL_STEPS: Array<{ id: FunnelEvent; label: string; help: string }> = [
  {
    id: 'view_item',
    label: 'Looked at a product',
    help: 'Someone opened a product page. Counted per view, not per person.',
  },
  {
    id: 'add_to_cart',
    label: 'Added it to the cart',
    help: 'They liked it enough to put it in the basket.',
  },
  {
    id: 'begin_checkout',
    label: 'Started checkout',
    help: 'They opened the checkout page with something in the basket.',
  },
  {
    id: 'payment_started',
    label: 'Went to pay',
    help: 'They filled in their details and were sent to PayFast.',
  },
  {
    id: 'payment_confirmed',
    label: 'Paid',
    help: 'PayFast confirmed the payment and the order was recorded.',
  },
];

export type FunnelRow = {
  id: FunnelEvent;
  label: string;
  help: string;
  count: number;
  /** Share of the previous step that reached this one, 0–1. Null at the top. */
  fromPrevious: number | null;
  /** Share of the very first step that reached this one, 0–1. Null at the top. */
  fromTop: number | null;
  /** How many were lost between the previous step and this one. */
  lost: number;
};

/** Turn raw tallies into the funnel, with the drop between each step. */
export function buildFunnel(counts: Partial<Record<FunnelEvent, number>>): FunnelRow[] {
  const top = Number(counts[FUNNEL_STEPS[0].id] ?? 0);
  let previous: number | null = null;

  return FUNNEL_STEPS.map((step) => {
    const count = Number(counts[step.id] ?? 0);
    const row: FunnelRow = {
      ...step,
      count,
      fromPrevious: previous === null ? null : previous > 0 ? count / previous : null,
      fromTop: previous === null ? null : top > 0 ? count / top : null,
      lost: previous === null ? 0 : Math.max(0, previous - count),
    };
    previous = count;
    return row;
  });
}

/**
 * The step that loses the most people, which is where effort pays off.
 *
 * Measured by how many were lost rather than by percentage, so a step that
 * drops 90% of four people does not outrank one that drops 40% of two hundred.
 * Steps with too little traffic to mean anything are skipped.
 */
export function biggestDropOff(rows: FunnelRow[], minimumTraffic = 5): FunnelRow | null {
  let worst: FunnelRow | null = null;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (rows[i - 1].count < minimumTraffic) continue;
    if (!worst || row.lost > worst.lost) worst = row;
  }
  return worst && worst.lost > 0 ? worst : null;
}

/**
 * What a drop at this step usually means, in the owner's language.
 *
 * Deliberately phrased as "usually" and "worth checking": these are the common
 * causes, not a diagnosis. The numbers say where to look, not what is wrong.
 */
export function explainDropOff(stepId: FunnelEvent): string {
  switch (stepId) {
    case 'add_to_cart':
      return 'People are looking at products but not adding them. That is usually the price, a description that does not answer their question, or photos that do not show what they are buying.';
    case 'begin_checkout':
      return 'They put something in the basket and left without starting checkout. The most common reason is the delivery cost appearing at that point, followed by not finding an obvious way to check out.';
    case 'payment_started':
      return 'They opened checkout and never reached the payment page. Usually the form asks for too much, or something failed while they were filling it in — check the failed checkouts below.';
    case 'payment_confirmed':
      return 'They reached PayFast and no payment came back. That can be a change of mind or a card being declined, but it is also what a broken payment notification looks like: the money leaves the customer and the site never finds out.';
    default:
      return 'Fewer people reached this step than the one before it.';
  }
}

/** Plain-English reasons a checkout was refused before payment could start. */
export function explainFailureReason(reason: string): string {
  switch (reason) {
    case 'out_of_stock':
      return 'The cart held more than you have in stock. The sale was lost at the last moment — worth keeping stock numbers current.';
    case 'not_configured':
      return 'Payment is not set up, so nobody could have paid. This is the most serious kind of failure here.';
    case 'empty_cart':
      return 'Checkout was submitted with nothing in the basket, usually a double click or an expired session.';
    case 'invalid_details':
      return 'The delivery details were incomplete or rejected.';
    case 'unavailable_product':
      return 'Something in the cart no longer exists in the shop — probably a product that was deleted while it sat in someone’s basket.';
    case 'server_error':
      return 'Something went wrong on the server while starting the payment.';
    default:
      return 'The checkout could not be started.';
  }
}

/** The tally stored against one day. */
export type DailyFunnel = {
  date: string;
  counts?: Partial<Record<FunnelEvent, number>>;
  failures?: Record<string, number>;
};

/** Add several days together, for a "last 30 days" view. */
export function sumDays(days: DailyFunnel[]): {
  counts: Partial<Record<FunnelEvent, number>>;
  failures: Record<string, number>;
} {
  const counts: Partial<Record<FunnelEvent, number>> = {};
  const failures: Record<string, number> = {};

  for (const day of days) {
    for (const [key, value] of Object.entries(day.counts ?? {})) {
      if (!isFunnelEvent(key)) continue;
      counts[key] = (counts[key] ?? 0) + (Number(value) || 0);
    }
    for (const [key, value] of Object.entries(day.failures ?? {})) {
      failures[key] = (failures[key] ?? 0) + (Number(value) || 0);
    }
  }

  return { counts, failures };
}

/** `YYYY-MM-DD` in UTC — the id of the day a tally belongs to. */
export function funnelDayId(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** The day ids covering the last `days` days, newest first. */
export function recentDayIds(days: number, now: Date = new Date()): string[] {
  const ids: string[] = [];
  for (let i = 0; i < days; i++) {
    ids.push(funnelDayId(new Date(now.getTime() - i * 86_400_000)));
  }
  return ids;
}
