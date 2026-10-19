import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import ProductPageContent from './product-page-content';
import { notFound } from 'next/navigation';
import { extractProductId, productUrl } from '@/lib/utils';
import { getGlobalShippingFee, getProduct, getProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { getUnitPrice } from '@/lib/pricing';

interface Props {
  params: Promise<{ id: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://workingongrass.co.za';

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  // Same cached fetch as the page body below, so this costs no extra read.
  const product = await getProduct(extractProductId(id));

  if (product === null) {
    return { title: 'Product Not Found' };
  }
  if (!product) {
    // Read failed: the page still renders client-side, just without rich metadata.
    return { title: 'Shop' };
  }

  const path = productUrl(product);
  const description = product.description?.substring(0, 160) ?? '';
  const image = product.images?.[0];
  const previousImages = (await parent).openGraph?.images || [];

  return {
    // Absolute so the brand is always appended (the shop layout's own title
    // otherwise stops the root "%s | Working on Grass" template reaching here).
    title: { absolute: `${product.name} | Working on Grass` },
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      url: `${SITE_URL}${path}`,
      images: image ? [{ url: image, alt: product.name }] : previousImages,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const docId = extractProductId(id);
  const [product, allProducts, globalShippingFee] = await Promise.all([
    getProduct(docId),
    getProducts(),
    getGlobalShippingFee(),
  ]);

  if (product === null) notFound();

  // The read failed: fall back to the old client-side fetch rather than 404/500.
  if (!product) {
    return <ProductPageContent productId={docId} />;
  }

  const related: Product[] | undefined = allProducts.length
    ? allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3)
    : undefined;

  const path = productUrl(product);
  const inStock = (product.stock ?? 0) > 0;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.[0],
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Working on Grass',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ZAR',
      price: getUnitPrice(product).toFixed(2),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}${path}`,
      seller: {
        '@type': 'Organization',
        name: 'Working on Grass',
      },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE_URL}${path}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductPageContent
        productId={docId}
        initialProduct={product}
        initialRelated={related}
        globalShippingFee={globalShippingFee}
      />
    </>
  );
}
