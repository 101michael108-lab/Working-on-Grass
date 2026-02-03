
"use client";

import ShopClient from '@/components/shop/ShopClient';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Suspense } from 'react';

export default function ShopPage() {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => query(collection(firestore, 'products'), orderBy('name')), [firestore]);
  const { data: products, isLoading } = useCollection<Omit<Product, 'id'>>(productsQuery);

  const LoadingSkeleton = () => (
     <div className="grid lg:grid-cols-4 gap-8 xl:gap-12">
        <aside className="lg:col-span-1">
             <div className="sticky top-24">
                <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
        </aside>
        <main className="lg:col-span-3">
            <Skeleton className="h-10 w-full mb-8" />
            <div className="space-y-16">
                 <div>
                    <Skeleton className="h-8 w-1/3 mb-6 pb-2" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-[450px] w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    </div>
  );

  return (
    <div className="container py-12 md:py-16">
       <Breadcrumbs items={[{ label: "Shop" }]} />
       <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline text-foreground">Products & Tools</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          A curated selection of tools, books, and seeds, field-tested and recommended by Working on Grass.
        </p>
      </div>
      <Suspense fallback={<LoadingSkeleton />}>
        {isLoading ? <LoadingSkeleton /> : <ShopClient products={products || []} />}
      </Suspense>
    </div>
  );
}
