import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { firestore } from '@/firebase/server-init';
import ProductPageContent from './product-page-content';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const doc = await firestore.collection('products').doc(id).get();
  
  if (!doc.exists) {
    return { title: 'Product Not Found' };
  }

  const product = doc.data();
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product?.name,
    description: product?.description?.substring(0, 160),
    openGraph: {
      images: [product?.images?.[0] || '', ...previousImages],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  
  // We just pass the ID to the client component which handles real-time data
  // but metadata is handled here on the server for SEO.
  return <ProductPageContent productId={id} />;
}
