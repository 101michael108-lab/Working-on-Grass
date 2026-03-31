
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, AlertCircle, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { productUrl } from '@/lib/utils';

// Pull the first plain-text paragraph — skip bullet lines
function getDescriptionTeaser(description: string): string {
  if (!description) return '';
  const firstPlain = description
    .split('\n')
    .find(l => {
      const t = l.trim();
      return t.length > 0 && !t.startsWith('•') && !t.startsWith('-') && !t.startsWith('*');
    });
  return firstPlain || description.split('\n')[0];
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const isOutOfStock = (product.stock ?? 0) <= 0;
  const teaser = getDescriptionTeaser(product.description);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border-2 border-border bg-card hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full">

      {isOutOfStock && (
        <Badge variant="destructive" className="absolute top-3 right-3 z-10 font-bold shadow">
          <AlertCircle className="h-3 w-3 mr-1" /> Out of Stock
        </Badge>
      )}

      {/* Image — 4:3, object-contain so full product is always visible */}
      <Link href={productUrl(product)} className="block overflow-hidden border-b border-border bg-white">
        <div className="relative aspect-[4/3] flex items-center justify-center p-4 sm:p-6">
          <Image
            src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/300`}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
            className={`object-contain transition-transform duration-500 group-hover:scale-[1.03] ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
          />
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-grow p-4 sm:p-5 gap-2">
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          {product.category}
        </Link>
        <Link href={productUrl(product)} className="block">
          <h3 className="font-headline text-lg sm:text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        {teaser && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-grow">
            {teaser}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-border">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xl font-bold font-headline text-accent">
            R{product.price.toFixed(2)}
          </p>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
            disabled={isOutOfStock}
            onClick={(e) => { e.preventDefault(); addToCart(product, 1); }}
          >
            <ShoppingCart className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
          </Button>
        </div>
        <Link
          href={productUrl(product)}
          className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          View details <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

    </div>
  );
}
