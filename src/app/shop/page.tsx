"use client";

import ShopClient from "@/components/shop/ShopClient";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Container } from "@/components/redesign/ui";

function SeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 20h10M10 20c5.5-2.5.42-8.5-1-11-1.42 2.5-6.5 8.5-1 11M12 9v11" />
    </svg>
  );
}

export default function ShopPage() {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(
    () => query(collection(firestore, "products"), orderBy("name")),
    [firestore]
  );
  const { data: products, isLoading } = useCollection<Omit<Product, "id">>(productsQuery);

  return (
    <div className="bg-cream">
      {/* Header band */}
      <section className="border-b border-line bg-cream-band">
        <Container className="pb-[46px] pt-[52px]">
          <div className="mb-3.5 font-mono text-[12px] text-gold-deep">Home / Shop</div>
          <h1 className="m-0 font-headline text-[clamp(32px,4vw,50px)] font-medium tracking-[-0.02em] text-ink">
            The Catalogue
          </h1>
          <p className="mt-4 max-w-[560px] text-[16px] leading-[1.6] text-body">
            Books and field instruments by Frits van Oudtshoorn, developed across thirty years of
            hands-on veld work, every item field-tested and recommended.
          </p>
        </Container>
      </section>

      {/* Seed notice */}
      <Container>
        <div className="flex items-center justify-between gap-5 border-b border-line py-5 max-[720px]:flex-col max-[720px]:items-start">
          <div className="flex items-center gap-3.5">
            <SeedIcon className="shrink-0 text-forest" />
            <p className="m-0 text-[13.5px] text-body-soft">
              <strong className="text-ink">Looking for grass seed?</strong> Seed isn&rsquo;t listed,
              Frits formulates custom mixes per farm and situation.
            </p>
          </div>
          <Link
            href="/seeds"
            className="whitespace-nowrap border-b border-forest pb-0.5 text-[13px] font-semibold text-forest no-underline"
          >
            Request a seed quote →
          </Link>
        </div>
      </Container>

      {/* Body */}
      <Container className="pb-[clamp(56px,7vw,90px)] pt-[34px]">
        {isLoading ? (
          <div className="grid gap-11 min-[940px]:grid-cols-[210px_1fr]">
            <Skeleton className="hidden h-[280px] min-[940px]:block" />
            <div className="grid grid-cols-1 gap-6 min-[560px]:grid-cols-2 min-[880px]:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[420px]" />
              ))}
            </div>
          </div>
        ) : (
          <ShopClient products={products || []} />
        )}
      </Container>
    </div>
  );
}
