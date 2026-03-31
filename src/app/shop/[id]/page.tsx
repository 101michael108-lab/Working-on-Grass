import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ProductPageContent from './product-page-content';
import { notFound } from 'next/navigation';
import { extractProductId, productUrl } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://workingongrass.co.za';

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const docId = extractProductId(id);
  const { firestore } = initializeFirebase();
  const docSnap = await getDoc(doc(firestore, 'products', docId));

  if (!docSnap.exists()) {
    return { title: 'Product Not Found' };
  }

  const product = { id: docSnap.id, ...docSnap.data() } as Product;
  const path = productUrl(product);
  const description = product.description?.substring(0, 160) ?? '';
  const image = product.images?.[0];
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product.name,
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
  const { firestore } = initializeFirebase();
  const docSnap = await getDoc(doc(firestore, 'products', docId));

  if (!docSnap.exists()) notFound();

  const product = { id: docSnap.id, ...docSnap.data() } as Product;
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
      price: product.price.toFixed(2),
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
      <ProductPageContent productId={docId} />
    </>
  );
}
