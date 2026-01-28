
"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { ShoppingCart } from "lucide-react"
import { products } from "@/lib/data"
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
                <div className="aspect-square bg-secondary/50 rounded-md overflow-hidden flex items-center justify-center p-4">
                  <Image
                    src={product.image || `https://picsum.photos/seed/${product.id}/300/300`}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="object-contain group-hover:scale-105 transition-transform h-48 w-auto"
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
                {product.category === 'Online Courses' ? 'Enroll Now' : 'Add to Cart'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}


export default function ShopPage() {
  const { addToCart } = useCart();
  
  const dpm = products.find(p => p.id === 'dpm-001');
  const otherProducts = products.filter(p => p.id !== 'dpm-001');

  const instruments = otherProducts.filter(p => p.category === 'Measurement & Tools');
  const books = otherProducts.filter(p => p.category === 'Books & Field Guides');
  const seeds = otherProducts.filter(p => p.category === 'Seeds & Pasture Products');
  const courses = otherProducts.filter(p => p.category === 'Online Courses');


  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Tools, Seeds & Guides for Professional Grassland Management</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Carefully selected and field-tested products used in real-world veld and grazing assessments. Selected and supplied by grassland specialist Frits van Oudtshoorn.
        </p>
      </div>

       {dpm && (
        <section id="dpm-featured" className="mb-16">
            <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2 items-center">
                    <div className="p-8 md:p-12 order-2 md:order-1">
                        <h2 className="text-3xl font-bold tracking-tight">Featured Tool: Disc Pasture Meter (DPM)</h2>
                        <p className="mt-4 text-muted-foreground">
                            Accurately measure veld productivity and grazing capacity — trusted by Working on Grass for professional veld assessments.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-6">
                           <span className="text-3xl font-bold text-accent">R{dpm.price.toFixed(2)}</span>
                           <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => dpm && addToCart(dpm, 1)}>
                             <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                           </Button>
                           <Button size="lg" variant="outline" asChild>
                             <Link href={`/shop/${dpm.id}`}>View Details</Link>
                           </Button>
                        </div>
                    </div>
                    <div className="bg-secondary/50 h-full flex items-center justify-center p-8 order-1 md:order-2">
                        {dpm.image && (
                          <Image
                            src={dpm.image}
                            alt={dpm.name}
                            width={450}
                            height={450}
                            className="object-contain rounded-lg"
                            data-ai-hint={dpm.imageHint}
                          />
                        )}
                    </div>
                </div>
            </Card>
        </section>
      )}


       <Card className="mb-12">
            <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold">Not sure which product or seed is right for your land?</h3>
                <p className="text-muted-foreground mt-2 mb-4">Request expert guidance before buying to ensure you get the best solution for your needs.</p>
                <Button asChild>
                    <Link href="/contact?service=Product+Guidance">Request Advice</Link>
                </Button>
            </CardContent>
        </Card>

      <div className="space-y-16">
          <CategorySection title="Online Courses" products={courses} id="courses" />
          <CategorySection title="Seeds & Pasture Products" products={seeds} id="seeds" />
          <CategorySection title="Measurement & Tools" products={instruments} id="tools" />
          <CategorySection title="Books & Field Guides" products={books} id="books" />
        </div>
      
    </div>
  );
}
