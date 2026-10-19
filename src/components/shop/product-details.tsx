"use client";

import type { Product } from "@/lib/types";
import ProductDetail from "@/components/shop/product-detail";

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
  isLoadingRelated: boolean;
  globalShippingFee?: number;
}

export default function ProductPageClient({ product, relatedProducts, isLoadingRelated, globalShippingFee }: ProductPageClientProps) {
  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts}
      isLoadingRelated={isLoadingRelated}
      globalShippingFee={globalShippingFee}
    />
  );
}
