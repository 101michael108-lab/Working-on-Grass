
"use client";

import React from 'react';
import ProductPageClient from '@/components/shop/product-details';
import { notFound, useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, documentId } from 'firebase/firestore';
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

export default function ProductPage() {
    const params = useParams();
    const productId = params.id as string;
    const firestore = useFirestore();

    const productRef = useMemoFirebase(() => {
        if (!productId) return null;
        return doc(firestore, 'products', productId);
    }, [firestore, productId]);

    const { data: product, isLoading: isLoadingProduct } = useDoc<Product>(productRef);
    
    const relatedProductsQuery = useMemoFirebase(() => {
        if (!product?.relatedProductIds || product.relatedProductIds.length === 0) return null;
        return query(collection(firestore, 'products'), where(documentId(), 'in', product.relatedProductIds));
    }, [product]);

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
        image: product.image,
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
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002'}/shop/${product.id}`,
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
