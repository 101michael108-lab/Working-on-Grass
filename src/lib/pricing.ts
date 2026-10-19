import type { Product } from '@/lib/types';

type PricedProduct = Pick<Product, 'price' | 'salePrice'>;

/**
 * The discounted price, or null when the product isn't on sale.
 *
 * A sale price only counts when it is a real reduction: missing, invalid, or
 * not-below-regular values are ignored, so a typo can never raise a price.
 */
export function getSalePrice(product: PricedProduct): number | null {
  if (product.salePrice == null || (product.salePrice as unknown) === '') return null;
  const sale = Number(product.salePrice);
  const regular = Number(product.price);
  if (!Number.isFinite(sale) || sale < 0 || !(sale < regular)) return null;
  return sale;
}

/** What the customer pays for one unit: the sale price when on sale, else the regular price. */
export function getUnitPrice(product: PricedProduct): number {
  return getSalePrice(product) ?? Number(product.price);
}

/** Longest sale label the storefront tag is laid out for (fits the narrowest shop card). */
export const SALE_LABEL_MAX_LENGTH = 20;

/** The sale's label (e.g. "Launch Special"), or null when there is none or the product isn't on sale. */
export function getSaleLabel(product: Pick<Product, 'price' | 'salePrice' | 'saleLabel'>): string | null {
  const label = typeof product.saleLabel === 'string' ? product.saleLabel.trim() : '';
  return label && getSalePrice(product) !== null ? label : null;
}

/** Whole-number percentage off the regular price (e.g. R450 → R399 is 11), or 0 when not on sale. */
export function getDiscountPercent(product: PricedProduct): number {
  const sale = getSalePrice(product);
  if (sale === null) return 0;
  const regular = Number(product.price);
  return Math.round(((regular - sale) / regular) * 100);
}
