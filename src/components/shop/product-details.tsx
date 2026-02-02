
"use client";

import React from 'react';
import type { Product } from '@/lib/types';
import InDepthLayout from './product-layouts/InDepthLayout';
import BookLayout from './product-layouts/BookLayout';
import StandardLayout from './product-layouts/StandardLayout';

interface ProductPageClientProps {
    product: Product;
    relatedProducts: Product[];
    isLoadingRelated: boolean;
}

export default function ProductPageClient({ product, relatedProducts, isLoadingRelated }: ProductPageClientProps) {
  switch (product.layout) {
    case 'in-depth':
      return <InDepthLayout product={product} relatedProducts={relatedProducts} isLoadingRelated={isLoadingRelated} />;
    case 'book':
      return <BookLayout product={product} relatedProducts={relatedProducts} isLoadingRelated={isLoadingRelated} />;
    case 'standard':
    default:
      return <StandardLayout product={product} relatedProducts={relatedProducts} isLoadingRelated={isLoadingRelated} />;
  }
}
