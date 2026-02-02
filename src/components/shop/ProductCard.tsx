
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
    <Card className="flex flex-col group overflow-hidden transition-shadow hover:shadow-lg h-full">
      <Link href={`/shop/${product.id}`} className="block relative aspect-[4/3] bg-secondary overflow-hidden border-b">
        <Image
          src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/300`}
          alt={product.name}
          fill
          className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <CardContent className="flex-grow p-4">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <Link href={`/shop/${product.id}`} className="block mt-1">
          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2 leading-tight">{product.name}</h3>
        </Link>
      </CardContent>
      <CardFooter className="p-4 mt-auto border-t">
        <div className="flex justify-between items-center w-full">
            <p className="text-xl font-bold text-accent">
                R{product.price.toFixed(2)}
            </p>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => addToCart(product, 1)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
