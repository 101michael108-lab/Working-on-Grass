"use client";

import ShopClient from '@/components/shop/ShopClient';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShopPage() {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => query(collection(firestore, 'products'), orderBy('name')), [firestore]);
  const { data: products, isLoading } = useCollection<Omit<Product, 'id'>>(productsQuery);

  const LoadingSkeleton = () => (
     <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
            <Skeleton className="h-[300px] w-full rounded-lg" />
        </aside>
        <main className="md:col-span-3">
            <Skeleton className="h-10 w-full mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                ))}
            </div>
        </main>
    </div>
  );

  return (
    <div className="container py-12 md:py-16">
       <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Products & Tools</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          A curated selection of tools, books, and seeds, field-tested and recommended by Working on Grass.
        </p>
      </div>
      {isLoading ? <LoadingSkeleton /> : <ShopClient products={products || []} />}
    </div>
  );
}
