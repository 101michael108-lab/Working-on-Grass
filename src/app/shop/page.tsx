"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { ShoppingCart } from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import type { Product } from "@/lib/types"

export default function ShopPage() {
  const { addToCart } = useCart()
  const firestore = useFirestore()
  const productsQuery = useMemoFirebase(() => query(collection(firestore, 'products'), orderBy('name')), [firestore]);
  const { data: products, isLoading } = useCollection<Omit<Product, 'id'>>(productsQuery);

  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Shop Our Products</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Invest in quality tools and resources for your land.
        </p>
      </div>

      {isLoading && <p className="text-center">Loading products...</p>}

      {!isLoading && products && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col group">
              <CardHeader>
                <Link href={`/shop/${product.id}`}>
                  <div className="aspect-square bg-secondary/50 rounded-md overflow-hidden flex items-center justify-center">
                    <Image
                      src={product.image || 'https://picsum.photos/seed/placeholder/300/300'}
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
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
       {!isLoading && !products?.length && (
         <div className="text-center text-muted-foreground">No products found. Please check back later.</div>
        )}
    </div>
  )
}
