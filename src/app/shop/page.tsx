
"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { ShoppingCart } from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import type { Product } from "@/lib/types"

function CategorySection({ title, products, id }: { title: string; products: Product[], id: string }) {
  const { addToCart } = useCart()

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section id={id}>
      <h2 className="text-3xl font-bold tracking-tight mb-8 border-b pb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col group">
            <CardHeader>
              <Link href={`/shop/${product.id}`}>
                <div className="aspect-square bg-secondary/50 rounded-md overflow-hidden flex items-center justify-center">
                  <Image
                    src={product.image || `https://picsum.photos/seed/${product.id}/300/300`}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="object-contain group-hover:scale-105 transition-transform"
                    data-ai-hint={product.imageHint}
                  />
                </div>
              </Link>
            </CardHeader>
            <CardContent className="flex-grow">
              <Link href={`/shop/${product.id}`}>
                <CardTitle className="text-xl hover:text-primary transition-colors">{product.name}</CardTitle>
              </Link>
              <p className="mt-2 text-2xl font-bold text-accent">
                R{product.price.toFixed(2)}
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => addToCart(product, 1)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}


export default function ShopPage() {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => query(collection(firestore, 'products'), orderBy('name')), [firestore]);
  const { data: products, isLoading } = useCollection<Omit<Product, 'id'>>(productsQuery);

  const instruments = products?.filter(p => p.category === 'Instruments') || [];
  const books = products?.filter(p => p.category === 'Books & Guides') || [];
  const seeds = products?.filter(p => p.category === 'Seeds') || [];
  const courses = products?.filter(p => p.category === 'Online Courses') || [];


  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Tools, Seeds & Guides for Professional Grassland Management</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Carefully selected and field-tested products used in real-world veld and grazing assessments. Selected and supplied by grassland specialist Frits van Oudtshoorn.
        </p>
      </div>

       <Card className="mb-12">
            <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold">Not sure which product or seed is right for your land?</h3>
                <p className="text-muted-foreground mt-2 mb-4">Request expert guidance before buying to ensure you get the best solution for your needs.</p>
                <Button asChild>
                    <Link href="/contact?service=Product+Guidance">Request Advice</Link>
                </Button>
            </CardContent>
        </Card>

      {isLoading && <p className="text-center">Loading products...</p>}

      {!isLoading && products && products.length > 0 ? (
        <div className="space-y-16">
          <CategorySection title="Measurement & Tools" products={instruments} id="tools" />
          <CategorySection title="Books & Field Guides" products={books} id="books" />
          <CategorySection title="Online Courses" products={courses} id="courses" />
          <CategorySection title="Seeds & Pasture Products" products={seeds} id="seeds" />
        </div>
      ) : null}

      {!isLoading && (!products || products.length === 0) && (
         <div className="text-center text-muted-foreground py-20">
          <h3 className="text-xl font-semibold">The shop is currently empty.</h3>
          <p>Please check back later or contact us for a custom order.</p>
        </div>
      )}
    </div>
  );
}
