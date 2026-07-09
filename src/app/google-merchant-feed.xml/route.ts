/**
 * Google Merchant Center product feed.
 *
 * Serves an RSS 2.0 + `g:` namespace product feed that Google Merchant Center
 * fetches on a schedule (Products → Add products → Scheduled fetch), pointed at:
 *
 *     https://workingongrass.co.za/google-merchant-feed.xml
 *
 * Reads live from Firestore, so price / stock / availability stay in sync with
 * the store without any manual re-upload. The two Veld Management titles are
 * tagged `custom_label_0 = veld-management` so a Shopping / Performance Max
 * campaign can target just those books.
 *
 * Spec: https://support.google.com/merchants/answer/7052112
 */
import { initializeFirebase } from '@/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { productUrl } from '@/lib/utils';
import type { Product, Specification } from '@/lib/types';

// Render at request time (never at build) so a deploy can't be blocked by a
// Firestore hiccup; the Cache-Control header below lets the CDN cache each
// response for an hour, and Merchant Center only fetches ~once a day.
export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://workingongrass.co.za').replace(/\/$/, '');
const DEFAULT_SHIPPING_FEE = 150; // fallback if settings/public is unreachable

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string)
  );
}

function tag(name: string, value: string | number): string {
  return `<${name}>${escapeXml(String(value))}</${name}>`;
}

/** Look up a specification row by its feature label (case-insensitive). */
function spec(product: Product, feature: string): string | undefined {
  return (product.specifications as Specification[] | undefined)?.find(
    (s) => s.feature?.toLowerCase() === feature.toLowerCase()
  )?.description?.trim();
}

/** ISBN-13 (starts 978/979) is a valid GTIN. Returns the 13-digit form or null. */
function isbnAsGtin(sku?: string): string | null {
  if (!sku) return null;
  const digits = sku.replace(/[^0-9]/g, '');
  return digits.length === 13 && /^(978|979)/.test(digits) ? digits : null;
}

/** Map the store's category to a Google product category (used for books here). */
function googleCategory(product: Product): string | null {
  const c = (product.category || '').toLowerCase();
  if (c.includes('book')) return 'Media > Books';
  if (c.includes('measure') || c.includes('tool')) return 'Hardware > Tools > Measuring Tools & Sensors';
  return null;
}

function buildItem(product: Product, globalShippingFee: number): string | null {
  const image = product.images?.[0];
  if (!image || product.price == null) return null; // Google requires image + price

  const inStock = (product.stock ?? 0) > 0;
  const isBook = (product.category || '').toLowerCase().includes('book');
  const price = Number(product.price).toFixed(2);
  const link = `${SITE_URL}${productUrl(product)}`;
  const description = (product.longDescription?.trim() || product.description?.trim() || product.name).slice(0, 4900);

  // Brand: explicit brand → publisher (books) → store name.
  const brand = product.brand?.trim() || spec(product, 'Publisher') || 'Working on Grass';

  const gtin = isbnAsGtin(product.sku);
  const shippingFee =
    product.shippingFee != null && !Number.isNaN(product.shippingFee) && product.shippingFee >= 0
      ? product.shippingFee
      : globalShippingFee;

  const parts: string[] = [
    tag('g:id', product.id),
    tag('g:title', product.name.slice(0, 150)),
    tag('g:description', description),
    tag('g:link', link),
    tag('g:image_link', image),
    tag('g:availability', inStock ? 'in_stock' : 'out_of_stock'),
    tag('g:price', `${price} ZAR`),
    tag('g:condition', 'new'),
    tag('g:brand', brand),
  ];

  const gCat = googleCategory(product);
  if (gCat) parts.push(tag('g:google_product_category', gCat));
  if (product.category) parts.push(tag('g:product_type', product.category));

  // Identifiers: real ISBN → GTIN; otherwise declare none (and give MPN for the tool).
  if (gtin) {
    parts.push(tag('g:gtin', gtin));
  } else {
    if (product.sku) parts.push(tag('g:mpn', product.sku));
    parts.push(tag('g:identifier_exists', 'no'));
  }

  // Per-product shipping (books → store flat rate, DPM → its override).
  parts.push(
    `<g:shipping>${tag('g:country', 'ZA')}${tag('g:service', 'Standard')}${tag(
      'g:price',
      `${shippingFee.toFixed(2)} ZAR`
    )}</g:shipping>`
  );

  // Tag the Veld Management titles so the ad campaign can target just them.
  if (isBook && /veld/i.test(product.name)) {
    parts.push(tag('g:custom_label_0', 'veld-management'));
  }
  const language = spec(product, 'Language');
  if (language) parts.push(tag('g:custom_label_1', language));

  return `    <item>\n      ${parts.join('\n      ')}\n    </item>`;
}

export async function GET() {
  const { firestore } = initializeFirebase();

  let globalShippingFee = DEFAULT_SHIPPING_FEE;
  try {
    const settingsSnap = await getDoc(doc(firestore, 'settings', 'public'));
    const fee = settingsSnap.data()?.shippingFee;
    if (typeof fee === 'number' && fee >= 0) globalShippingFee = fee;
  } catch {
    // fall back to DEFAULT_SHIPPING_FEE
  }

  const snap = await getDocs(collection(firestore, 'products'));
  const items: string[] = [];
  snap.forEach((d) => {
    const product = { id: d.id, ...d.data() } as Product;
    const item = buildItem(product, globalShippingFee);
    if (item) items.push(item);
  });

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
    `  <channel>\n` +
    `    <title>Working on Grass — Product Feed</title>\n` +
    `    <link>${SITE_URL}</link>\n` +
    `    <description>Veld &amp; pasture management books and field tools.</description>\n` +
    `${items.join('\n')}\n` +
    `  </channel>\n` +
    `</rss>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
