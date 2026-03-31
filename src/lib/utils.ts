import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
