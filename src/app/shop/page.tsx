
"use client";

"use client";

import ShopClient from '@/components/shop/ShopClient';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Suspense } from 'react';
import Link from 'next/link';
import { Sprout } from 'lucide-react';

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
       <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline text-foreground">Books & Field Instruments</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Books and field tools by Frits van Oudtshoorn — developed from 30 years of hands-on veld work.
        </p>
      </div>
      {/* Seed enquiry notice */}
      <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/50 border-2 border-dashed border-primary/20 rounded-lg px-6 py-4">
        <div className="flex items-center gap-3">
          <Sprout className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Looking for grass seed?</strong>{" "}
            Seed is not listed in the shop — Frits formulates custom mixes per farm and situation.
          </p>
        </div>
        <Link href="/seeds" className="text-sm font-bold text-primary hover:underline whitespace-nowrap shrink-0">
          Request a Seed Quote →
        </Link>
      </div>
      <Suspense fallback={<LoadingSkeleton />}>
        {isLoading ? <LoadingSkeleton /> : <ShopClient products={products || []} />}
      </Suspense>
    </div>
  );
}
