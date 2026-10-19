/**
 * Google tag (Ads + GA4) helpers.
 *
 * gtag.js itself is lazy-loaded by <Analytics /> (see components/analytics.tsx);
 * everything here only queues commands on `window.dataLayer`, which gtag.js
 * drains when it arrives. So `track()` is safe to call at any time, from any
 * client component, including before the real script has loaded.
 */
import type { Product } from '@/lib/types';
import { getSalePrice, getUnitPrice } from '@/lib/pricing';

/** Google Ads conversion account. */
export const ADS_ID = 'AW-18311112344';
/** GA4 property — the one Firebase Analytics used to report to. */
export const GA4_ID = 'G-QQGK35J3TB';
/** Ads conversion action for a completed purchase. */
export const ADS_PURCHASE_CONVERSION = `${ADS_ID}/qnCiCKGz3c8cEJjNtZtE`;

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __wogGtagReady?: boolean;
};

/**
 * Define dataLayer + the gtag() shim and queue the config commands — exactly
 * once, whoever gets here first (the Analytics component or an early track()
 * call). Config must precede events in the queue or GA4 has nowhere to send them.
 */
export function ensureGtag(): ((...args: unknown[]) => void) | null {
  if (typeof window === 'undefined') return null;
  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  if (typeof w.gtag !== 'function') {
    w.gtag = function gtag() {
      // gtag.js expects the Arguments object itself, not an array.
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    };
  }
  if (!w.__wogGtagReady) {
    w.__wogGtagReady = true;
    w.gtag('js', new Date());
    w.gtag('config', ADS_ID);
    w.gtag('config', GA4_ID);
  }
  return w.gtag;
}

/** Queue a gtag event. Never throws: analytics must not break the page. */
export function track(event: string, params: Record<string, unknown> = {}): void {
  try {
    ensureGtag()?.('event', event, params);
  } catch {
    /* ignore */
  }
}

/** A product as a GA4 ecommerce `item`. */
export function toGaItem(product: Pick<Product, 'id' | 'name' | 'price' | 'salePrice' | 'category' | 'brand'>, quantity = 1) {
  const salePrice = getSalePrice(product);
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    ...(product.brand ? { item_brand: product.brand } : {}),
    price: getUnitPrice(product),
    // GA4 `discount` is the per-unit amount off the regular price.
    ...(salePrice !== null ? { discount: Number(product.price) - salePrice } : {}),
    quantity,
  };
}
