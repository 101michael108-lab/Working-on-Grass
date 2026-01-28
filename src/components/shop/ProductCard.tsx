
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  return (
    <Card className="flex flex-col group">
      <CardHeader className="p-0">
        <Link href={`/shop/${product.id}`}>
          <div className="aspect-square bg-secondary/50 rounded-t-lg overflow-hidden flex items-center justify-center p-4">
            <Image
              src={product.image || `https://picsum.photos/seed/${product.id}/300/300`}
              alt={product.name}
              width={300}
              height={300}
              className="object-cover h-full w-full group-hover:scale-105 transition-transform"
              data-ai-hint={product.imageHint}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <Link href={`/shop/${product.id}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors truncate">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">{product.category}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
         <p className="text-xl font-bold text-accent">
            R{product.price.toFixed(2)}
        </p>
        <Button size="icon" variant="outline" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => addToCart(product, 1)}>
            <ShoppingCart className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
