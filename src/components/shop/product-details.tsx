
"use client";

import React from 'react';
import type { Product } from '@/lib/types';
import ProductPage from './product-layouts/ProductPage';

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
  isLoadingRelated: boolean;
}

export default function ProductPageClient({ product, relatedProducts, isLoadingRelated }: ProductPageClientProps) {
  return (
    <ProductPage
      product={product}
      relatedProducts={relatedProducts}
      isLoadingRelated={isLoadingRelated}
    />
  );
}
