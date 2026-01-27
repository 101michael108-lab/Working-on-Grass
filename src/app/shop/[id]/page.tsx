
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import ProductDetailsClient from '@/components/shop/product-details';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

type ProductPageProps = {
  params: {
    id: string;
  };
};

// The main page component
export default function ProductPage({ params }: ProductPageProps) {
  const firestore = useFirestore();
  const productRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'products', params.id);
  }, [firestore, params.id]);

  const { data: product, isLoading, error } = useDoc<Product>(productRef);

  // JSON-LD for Google Rich Snippets & Merchant Center
  const jsonLd = product ? {
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
  } : null;

  if (isLoading) {
    // Show a skeleton loader while the product data is being fetched
    return (
        <div className="container py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <div>
                    <Skeleton className="w-full aspect-square rounded-lg" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-24 w-full" />
                    <Card className="mt-8 bg-background/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-32" />
                                <Skeleton className="h-12 flex-grow" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <div className="mt-16">
                <Skeleton className="h-10 w-1/4 mb-4" />
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
    );
  }

  if (error) {
    // This could be a permissions error or network issue
    return (
      <div className="container flex min-h-[50vh] items-center justify-center text-center">
        <div>
            <h2 className="text-2xl font-bold">Error Loading Product</h2>
            <p className="text-muted-foreground mt-2">Could not fetch product details. Please try again later.</p>
        </div>
      </div>
    )
  }

  if (!product) {
    // After loading, if product is still null, it means it doesn't exist.
    return (
        <div className="container flex min-h-[50vh] items-center justify-center text-center">
            <div>
                <h2 className="text-2xl font-bold">Product Not Found</h2>
                <p className="text-muted-foreground mt-2">The product you are looking for does not exist.</p>
            </div>
        </div>
    );
  }

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
