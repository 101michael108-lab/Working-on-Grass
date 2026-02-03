"use client";

import React from 'react';
import ProductPageClient from '@/components/shop/product-details';
import { notFound } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, documentId, limit } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function ProductLoadingSkeleton() {
    return (
        <div className="container py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="space-y-6">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-8 w-1/3" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
             <div className="mt-16">
                 <Skeleton className="h-10 w-1/3" />
                 <Skeleton className="h-40 w-full mt-4" />
            </div>
        </div>
    )
}

export default function ProductPageContent({ productId }: { productId: string }) {
    const firestore = useFirestore();

    const productRef = useMemoFirebase(() => {
        if (!productId) return null;
        return doc(firestore, 'products', productId);
    }, [firestore, productId]);

    const { data: product, isLoading: isLoadingProduct } = useDoc<Product>(productRef);
    
    const relatedProductsQuery = useMemoFirebase(() => {
        if (!product) return null;
        return query(
            collection(firestore, 'products'), 
            where('category', '==', product.category),
            where(documentId(), '!=', productId),
            limit(3)
        );
    }, [product, productId, firestore]);

    const { data: relatedProducts, isLoading: isLoadingRelated } = useCollection<Product>(relatedProductsQuery);

    if (isLoadingProduct) {
        return <ProductLoadingSkeleton />;
    }

    if (!product) {
        notFound();
        return null;
    }

    const jsonLd = {
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
            availability: 'https://schema.org/InStock',
            url: `${typeof window !== 'undefined' ? window.location.origin : ''}/shop/${product.id}`,
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductPageClient 
                product={product} 
                relatedProducts={relatedProducts || []}
                isLoadingRelated={isLoadingRelated}
            />
        </>
    );
}
