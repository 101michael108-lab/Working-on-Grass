
"use client";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function RelatedProducts({ products, isLoading }: { products: Product[], isLoading: boolean }) {
    if (isLoading) {
        return (
             <section className="py-16 md:py-24 bg-secondary/30">
                <div className="container">
                    <h2 className="text-3xl font-bold mb-8">Related Products</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-[420px] w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            </section>
        )
    }
    
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="py-16 md:py-24 bg-secondary/30">
            <div className="container">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold">Related Products & Resources</h2>
                    <Button variant="outline" asChild>
                        <Link href="/shop">View All <ArrowRight className="ml-2"/></Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}

    