
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

/**
 * The server normally passes the product (and related products) in, so the page
 * renders straight from the HTML. The client-side Firestore reads below only run
 * as a fallback when that server read failed.
 */
export default function ProductPageContent({
    productId,
    initialProduct,
    initialRelated,
    globalShippingFee,
}: {
    productId: string;
    initialProduct?: Product;
    initialRelated?: Product[];
    globalShippingFee?: number;
}) {
    const firestore = useFirestore();

    const productRef = useMemoFirebase(() => {
        if (initialProduct || !productId) return null;
        return doc(firestore, 'products', productId);
    }, [firestore, productId, initialProduct]);

    const { data: fetchedProduct, isLoading: isLoadingProduct } = useDoc<Product>(productRef);
    const product = initialProduct ?? fetchedProduct;

    const relatedProductsQuery = useMemoFirebase(() => {
        if (!product || initialRelated) return null;
        return query(
            collection(firestore, 'products'),
            where('category', '==', product.category),
            where(documentId(), '!=', productId),
            limit(3)
        );
    }, [product, productId, firestore, initialRelated]);

    const { data: fetchedRelated, isLoading: isLoadingRelated } = useCollection<Product>(relatedProductsQuery);

    if (!product && isLoadingProduct) {
        return <ProductLoadingSkeleton />;
    }

    if (!product) {
        notFound();
        return null;
    }

    return (
        <ProductPageClient
            product={product}
            relatedProducts={initialRelated ?? fetchedRelated ?? []}
            isLoadingRelated={!initialRelated && isLoadingRelated}
            globalShippingFee={globalShippingFee}
        />
    );
}
