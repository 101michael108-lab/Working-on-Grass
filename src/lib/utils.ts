import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a rand amount for display, e.g. 4500 → "R4 500.00".
 *
 * One formatter for every storefront price so cards, product pages, cart and
 * checkout agree. Deliberately not toLocaleString: server and browser ICU data
 * can differ, which would cause hydration mismatches. Thousands are grouped
 * with a non-breaking space so a price never wraps across lines.
 */
export function formatRand(amount: number): string {
  const [whole, cents] = Math.abs(amount).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${amount < 0 ? '-' : ''}R${grouped}.${cents}`;
}

/** Convert a string to a URL-friendly slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Build a SEO-friendly product URL: /shop/product-name--DOCID */
export function productUrl(product: { id: string; name: string }): string {
  return `/shop/${slugify(product.name)}--${product.id}`;
}

/** Extract the Firestore document ID from a product URL slug */
export function extractProductId(slug: string): string {
  // Format: "product-name--DOCID"  (double-dash separator)
  // Fallback: treat entire value as a raw doc ID (legacy links)
  const idx = slug.lastIndexOf('--');
  return idx !== -1 ? slug.slice(idx + 2) : slug;
}
