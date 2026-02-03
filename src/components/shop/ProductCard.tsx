'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Card className="flex flex-col group overflow-hidden transition-all hover:border-primary/50 h-full border-2">
      <Link href={`/shop/${product.id}`} className="block relative aspect-square bg-muted/50 overflow-hidden border-b-2">
        <Image
          src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/400`}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      <CardContent className="flex-grow p-5">
        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
          {product.category}
        </span>
        <Link href={`/shop/${product.id}`} className="block mt-2">
          <h3 className="font-headline text-xl hover:text-primary transition-colors line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </Link>
      </CardContent>
      <CardFooter className="p-5 mt-auto border-t-2 bg-muted/20">
        <div className="flex justify-between items-center w-full">
            <p className="text-xl font-bold font-headline text-accent">
                R{product.price.toFixed(2)}
            </p>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => addToCart(product, 1)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
