import React from 'react';
import { getProduct, products } from '@/lib/data';
import ProductDetailsClient from '@/components/shop/product-details';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = getProduct(params.id);

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }
 
  return {
    title: `${product.name} | Working on Grass`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Working on Grass`,
      description: product.description,
      images: [
        {
          url: product.image || '',
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  }
}

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}

// The main page component
export default function ProductPage({ params }: Props) {
  const product = getProduct(params.id);

  if (!product) {
    notFound();
  }

  // JSON-LD for Google Rich Snippets & Merchant Center
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Working on Grass',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ZAR', // Assuming South African Rand
      price: product.price.toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002'}/shop/${product.id}`,
    },
  };

  return (
    <>
      {jsonLd && (
         <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
      )}
      <ProductDetailsClient product={product} />
    </>
  );
}
