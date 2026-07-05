'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { productUrl } from '@/lib/utils';
import { hatchCream } from '@/components/redesign/ui';

// First plain-text paragraph — skip bullet lines.
function getTeaser(description: string): string {
  if (!description) return '';
  const firstPlain = description
    .split('\n')
    .find((l) => {
      const t = l.trim();
      return t.length > 0 && !t.startsWith('•') && !t.startsWith('-') && !t.startsWith('*');
    });
  return firstPlain || description.split('\n')[0];
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const isOutOfStock = (product.stock ?? 0) <= 0;
  const url = productUrl(product);
  const img = product.images?.[0];
  const teaser = getTeaser(product.description);

  return (
    <div className="flex flex-col border border-line bg-cream-card animate-wog-fade">
      {/* Image */}
      <Link
        href={url}
        prefetch={false}
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-line no-underline"
        style={img ? undefined : hatchCream}
      >
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(min-width:940px) 33vw, (min-width:640px) 50vw, 100vw"
            className={`object-contain p-5 transition-transform duration-500 hover:scale-[1.03] ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
          />
        ) : (
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A2A492]">
            {product.category}
          </span>
        )}
        {isOutOfStock ? (
          <span className="absolute right-3 top-3 rounded-[2px] border border-gold-border bg-gold-bg px-2 py-[3px] font-body text-[10px] font-bold uppercase tracking-[0.08em] text-gold-text">
            Sold out
          </span>
        ) : product.isDigital ? (
          <span className="absolute right-3 top-3 rounded-[2px] border border-gold-border bg-gold-bg px-2 py-[3px] font-body text-[10px] font-bold uppercase tracking-[0.08em] text-gold-text">
            Digital
          </span>
        ) : null}
      </Link>

      {/* Body */}
      <div className="flex flex-grow flex-col p-5">
        <span className="mb-2 font-body text-[10.5px] font-semibold uppercase tracking-[0.14em] text-body-faint">
          {product.category}
        </span>
        <Link
          href={url}
          prefetch={false}
          className="mb-2 font-headline text-[20px] font-semibold leading-tight text-ink no-underline transition-colors hover:text-forest"
        >
          {product.name}
        </Link>
        {teaser && (
          <p className="mb-5 line-clamp-3 flex-grow text-[13.5px] leading-[1.55] text-body-soft">{teaser}</p>
        )}
        <div className="flex items-center justify-between border-t border-cream-line pt-4">
          <div className="flex flex-col">
            <span className="font-body text-[19px] font-bold leading-none text-ink">R{product.price.toFixed(2)}</span>
            {product.price > 0 && (
              <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-body-faint">Incl. VAT</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className="inline-flex items-center gap-1.5 rounded-[3px] bg-forest px-4 py-2.5 font-body text-[13px] font-semibold text-ondark-bright transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-[15px] w-[15px]" strokeWidth={1.8} />
            {isOutOfStock ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
