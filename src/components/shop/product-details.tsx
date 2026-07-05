"use client";

import type { Product } from "@/lib/types";
import ProductDetail from "@/components/shop/product-detail";

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
  isLoadingRelated: boolean;
}

export default function ProductPageClient({ product, relatedProducts, isLoadingRelated }: ProductPageClientProps) {
  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts}
      isLoadingRelated={isLoadingRelated}
    />
  );
}
