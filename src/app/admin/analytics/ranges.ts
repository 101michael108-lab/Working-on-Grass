/** Date ranges offered on the funnel page, and the cap on days fetched. */
export const RANGES = [
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
] as const;

export type RangeId = (typeof RANGES)[number]['id'];

/** Hard ceiling on day documents read in one load, whatever the range asks. */
export const FUNNEL_COLLECTION_LIMIT = 90;
