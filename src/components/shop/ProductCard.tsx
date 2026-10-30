'use client';
import type { MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { formatRand, productUrl } from '@/lib/utils';
import { getDiscountPercent, getSaleLabel, getSalePrice } from '@/lib/pricing';

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
  const salePrice = getSalePrice(product);
  const saleLabel = getSaleLabel(product);

  // Keep Add working above the stretched card link.
  const handleAdd = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) addToCart(product, 1);
  };

  return (
    <div className="group relative flex flex-col border border-line bg-cream-card shadow-lifted transition-[box-shadow,border-color] duration-200 animate-wog-fade hover:border-line-strong hover:shadow-lifted-lg">
      {/* Image (whole card is clickable via the stretched title link) */}
      <div
        className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-line ${img ? 'bg-white shadow-sunken' : 'bg-cream-band'}`}
      >
        {img && (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(min-width:940px) 33vw, (min-width:640px) 50vw, 100vw"
            className={`object-contain p-5 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
          />
        )}
        {isOutOfStock ? (
          <span className="absolute right-3 top-3 z-[1] rounded-[2px] border border-gold-border bg-gold-bg px-2 py-[3px] font-body text-[10px] font-bold uppercase tracking-[0.08em] text-gold-text">
            Sold out
          </span>
        ) : product.isDigital ? (
          <span className="absolute right-3 top-3 z-[1] rounded-[2px] border border-gold-border bg-gold-bg px-2 py-[3px] font-body text-[10px] font-bold uppercase tracking-[0.08em] text-gold-text">
            Digital
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="relative flex flex-grow flex-col p-5">
        {/* Sale tags sit on the image/body divider, aligned with the text column:
            never over the product photo (the image box keeps 20px padding) and they
            add no height. One fixed-height line: if a card is too narrow for both
            tags, "% off" wraps onto the clipped second line and drops out whole,
            rather than overflowing (the struck-through price still shows the deal). */}
        {salePrice !== null && (
          <div className="pointer-events-none absolute inset-x-5 top-0 z-[1] flex h-[23px] -translate-y-1/2 flex-wrap gap-x-1 overflow-hidden font-body text-[10px] font-bold uppercase leading-[15px] tracking-[0.08em]">
            {saleLabel && (
              <span className="max-w-full truncate rounded-[2px] border border-sale bg-sale px-2 py-[3px] text-white">{saleLabel}</span>
            )}
            <span className="rounded-[2px] border border-sale-border bg-sale-bg px-2 py-[3px] text-sale">
              {getDiscountPercent(product)}% off
            </span>
          </div>
        )}
        <span className="mb-2 font-body text-[10.5px] font-semibold uppercase tracking-[0.14em] text-body-faint">
          {product.category}
        </span>
        <h3 className="mb-2 font-headline text-[20px] font-semibold leading-tight text-ink">
          <Link
            href={url}
            prefetch={false}
            className="text-ink no-underline transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-forest"
          >
            {product.name}
          </Link>
        </h3>
        {teaser && (
          <p className="mb-5 line-clamp-3 text-[13.5px] leading-[1.55] text-body-soft">{teaser}</p>
        )}
        {/* mt-auto, not flex-grow on the teaser: a stretched line-clamp box shows a cut-off 4th line. */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-cream-line pt-4">
          <div className="flex min-w-0 flex-col">
            {salePrice !== null ? (
              <>
                <span className="font-body text-[19px] font-bold leading-none text-sale">
                  <span className="sr-only">Sale price </span>
                  {formatRand(salePrice)}
                </span>
                {/* Regular price + VAT note share one 14px line, like "Incl. VAT" on other
                    cards, so price rows (and their dividers) line up across the grid. On
                    the narrowest cards "Incl. VAT" wraps onto the clipped second line and
                    drops out visually; screen readers still read it. */}
                <span className="mt-1 flex h-[14px] flex-wrap items-baseline gap-x-1.5 overflow-hidden leading-[14px]">
                  <span className="sr-only">Regular price </span>
                  <s className="font-body text-[12px] font-medium text-body-faint">{formatRand(product.price)}</s>
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-body-faint">Incl. VAT</span>
                </span>
              </>
            ) : (
              <>
                <span className="font-body text-[19px] font-bold leading-none text-ink">{formatRand(product.price)}</span>
                {product.price > 0 && (
                  <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-body-faint">Incl. VAT</span>
                )}
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="relative z-[1] inline-flex items-center gap-1.5 rounded-[3px] bg-forest px-4 py-2.5 font-body text-[13px] font-semibold text-ondark-bright transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-[15px] w-[15px]" strokeWidth={1.8} />
            {isOutOfStock ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
