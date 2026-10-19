"use client";

import ShopClient from "@/components/shop/ShopClient";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

/** Client-side catalogue, used only when the server-side product read failed. */
export default function ShopClientFallback({ initialCategory }: { initialCategory?: string }) {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(
    () => query(collection(firestore, "products"), orderBy("name")),
    [firestore]
  );
  const { data: products, isLoading } = useCollection<Omit<Product, "id">>(productsQuery);

  if (isLoading) {
    return (
      <div className="grid gap-11 min-[940px]:grid-cols-[210px_1fr]">
        <Skeleton className="hidden h-[280px] min-[940px]:block" />
        <div className="grid grid-cols-1 gap-6 min-[560px]:grid-cols-2 min-[880px]:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[420px]" />
          ))}
        </div>
      </div>
    );
  }

  return <ShopClient products={products || []} initialCategory={initialCategory} />;
}
