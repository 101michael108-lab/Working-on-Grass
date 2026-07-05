"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import type { Product } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/shop/ProductCard";

const ALL = "All products";

export default function ShopClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [activeCat, setActiveCat] = useState<string>(ALL);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (categoryParam) setActiveCat(categoryParam);
  }, [categoryParam]);

  // Category list with counts, in a stable, sensible order.
  const categories = useMemo(() => {
    const order = ["Measurement & Tools", "Books & Field Guides", "Seeds & Pasture Products", "Online Courses"];
    const present = [...new Set(products.map((p) => p.category))];
    const ordered = order.filter((c) => present.includes(c));
    const extras = present.filter((c) => !order.includes(c));
    const names = [ALL, ...ordered, ...extras];
    return names.map((name) => ({
      name,
      count: name === ALL ? products.length : products.filter((p) => p.category === name).length,
    }));
  }, [products]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCat = activeCat === ALL || p.category === activeCat;
      const matchesSearch =
        !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, activeCat, searchTerm]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="grid grid-cols-1 gap-11 min-[940px]:grid-cols-[210px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="hidden min-[940px]:block">
        <div className="sticky top-24">
          <div className="mb-4 border-b border-line pb-3 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-body-faint">
            Categories
          </div>
          <div className="flex flex-col">
            {categories.map((c) => {
              const active = activeCat === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setActiveCat(c.name)}
                  className={cn(
                    "mb-1.5 flex items-center justify-between gap-2.5 rounded-[3px] border px-3.5 py-2.5 text-left font-body text-[13.5px] transition-colors",
                    active
                      ? "border-forest bg-forest font-semibold text-ondark-bright"
                      : "border-line font-medium text-body-soft hover:border-forest"
                  )}
                >
                  <span>{c.name}</span>
                  <span className="font-mono text-[11px] opacity-60">{pad(c.count)}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 border border-line bg-cream-band p-5">
            <div className="mb-1.5 font-headline text-[16px] font-semibold text-ink">Need advice first?</div>
            <p className="m-0 mb-3.5 text-[12.5px] leading-[1.5] text-body-soft">
              Not sure which resource fits your land? Ask Frits.
            </p>
            <Link
              href="/contact"
              className="border-b border-forest pb-0.5 text-[12.5px] font-semibold text-forest no-underline"
            >
              Get in touch →
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main>
        {/* Mobile category chips */}
        <div className="mb-5 flex flex-wrap gap-2 min-[940px]:hidden">
          {categories.map((c) => {
            const active = activeCat === c.name;
            return (
              <button
                key={c.name}
                onClick={() => setActiveCat(c.name)}
                className={cn(
                  "rounded-[3px] border px-3 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "border-forest bg-forest text-ondark-bright"
                    : "border-line text-body-soft hover:border-forest"
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        <div className="mb-[26px] flex items-center justify-between gap-4 border-b border-line pb-4">
          <span className="font-headline text-[22px] font-semibold text-ink">{activeCat}</span>
          <span className="whitespace-nowrap font-mono text-[12px] text-body-faint">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-body-faint" />
          <input
            type="text"
            placeholder="Search by name or type…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[3px] border border-line-strong bg-cream-card py-3 pl-11 pr-4 font-body text-[14px] text-ink outline-none placeholder:text-body-faint focus:border-forest"
          />
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 min-[560px]:grid-cols-2 min-[880px]:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-line py-20 text-center">
            <h3 className="font-headline text-[20px] font-semibold text-ink">No products found</h3>
            <p className="mt-2 text-[14px] text-body-soft">Try adjusting your search or category.</p>
          </div>
        )}
      </main>
    </div>
  );
}
