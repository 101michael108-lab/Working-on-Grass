import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ProductPageContent from './product-page-content';
import { notFound } from 'next/navigation';
import { extractProductId } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const docId = extractProductId(id);
  const { firestore } = initializeFirebase();
  const docRef = doc(firestore, 'products', docId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return { title: 'Product Not Found' };
  }

  const product = docSnap.data();
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
  return <ProductPageContent productId={extractProductId(id)} />;
}
