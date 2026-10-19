import { getPublicDocument, listPublicCollection } from '@/lib/firestore-rest';
import type { Product, SiteSettings } from '@/lib/types';

/**
 * Server-side reads for the shop, so product pages and the catalogue ship real
 * HTML (name, price, image, description) instead of a skeleton that only fills
 * in after the Firebase SDK boots on the visitor's phone.
 *
 * Products are cached for a minute: short enough that admin edits show up almost
 * immediately, while checkout re-prices and re-checks stock on the server anyway.
 */
const PRODUCTS_REVALIDATE_SECONDS = 60;
const PRODUCTS_TAG = 'products';

export function getProducts(): Promise<Product[]> {
  return listPublicCollection<Product>('products', {
    orderBy: 'name',
    revalidate: PRODUCTS_REVALIDATE_SECONDS,
    tag: PRODUCTS_TAG,
  });
}

/** See getPublicDocument: `null` = not found, `undefined` = read failed. */
export function getProduct(id: string): Promise<Product | null | undefined> {
  return getPublicDocument<Product>('products', id, {
    revalidate: PRODUCTS_REVALIDATE_SECONDS,
    tag: PRODUCTS_TAG,
  });
}

/** Store-wide delivery fee from settings/public, or undefined if it can't be read. */
export async function getGlobalShippingFee(): Promise<number | undefined> {
  const settings = await getPublicDocument<Pick<SiteSettings, 'shippingFee'>>('settings', 'public', {
    revalidate: 300,
  });
  const fee = Number(settings?.shippingFee);
  return Number.isFinite(fee) && fee >= 0 ? fee : undefined;
}
