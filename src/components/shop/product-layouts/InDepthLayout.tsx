
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import RelatedProducts from '../RelatedProducts';
import { useCart } from '@/context/cart-context';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, CheckCircle2, MapPin, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { ProductImageGallery } from '../ProductImageGallery';
import Link from 'next/link';
import { ShareButtons } from '@/components/share-buttons';

const WA_NUMBER = "27782280008";

// Pull just the first plain-text paragraph for the header — bullets go in features below
function getHeaderDescription(text: string): string {
  if (!text) return '';
  const firstPlain = text.split('\n').find(l => {
    const t = l.trim();
    return t.length > 0 && !t.startsWith('•') && !t.startsWith('-') && !t.startsWith('*');
  });
  return firstPlain || '';
}

const renderFormattedText = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const content = trimmed.substring(1).trim();
      return (
        <div key={i} className="flex items-start gap-3 mb-3 pl-2">
          <span className="text-primary font-bold mt-1.5 flex-shrink-0 text-xs">•</span>
          <span className="text-foreground/80 leading-relaxed min-w-0">{content}</span>
        </div>
      );
    }
    return line ? <p key={i} className="mb-4 text-foreground/80 leading-relaxed">{line}</p> : <div key={i} className="h-4" />;
  });
};

export default function InDepthLayout({ product, relatedProducts, isLoadingRelated }: { product: Product, relatedProducts: Product[], isLoadingRelated: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [shareUrl, setShareUrl] = useState('');
  const [added, setAdded] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const purchaseBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  // Only show the sticky CTA after the inline purchase box scrolls out of view
  useEffect(() => {
    const el = purchaseBoxRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCTA(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handleAddToCart = useCallback(() => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [addToCart, product, quantity]);

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const waOrderUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi, I have a question about ordering the ${product.name}.`)}`;
  const headerDescription = getHeaderDescription(product.description);

  return (
    <div className="bg-background overflow-x-hidden">

      {/* ── Header ────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="container py-8 md:py-16">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Image — full width mobile, 7 cols desktop */}
            <div className="lg:col-span-7 min-w-0">
              <ProductImageGallery images={product.images || []} productName={product.name} />
            </div>

            {/* Content — 5 cols desktop */}
            <div className="lg:col-span-5 min-w-0 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Link
                    href={`/shop?category=${encodeURIComponent(product.category)}`}
                    className="text-xs font-bold uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
                  >
                    {product.category}
                  </Link>
                  {isOutOfStock && (
                    <span className="flex items-center gap-1 text-xs font-bold text-destructive uppercase tracking-widest">
                      <AlertTriangle className="h-3 w-3" /> Out of Stock
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline leading-tight">
                  {product.name}
                </h1>

                {/* Short intro — first plain paragraph, capped at 3 lines on mobile */}
                {headerDescription && (
                  <p className="text-base md:text-lg text-muted-foreground font-body leading-relaxed line-clamp-3 md:line-clamp-none">
                    {headerDescription}
                  </p>
                )}

                {product.valueProposition && (
                  <div className="bg-accent/5 border-l-4 border-accent p-4 shadow-sm">
                    <p className="text-foreground font-body font-bold italic leading-relaxed text-sm md:text-base">
                      {product.valueProposition}
                    </p>
                  </div>
                )}
              </div>

              {/* Purchase box */}
              <div ref={purchaseBoxRef} className="bg-surface border-2 border-border p-5 rounded-lg shadow-sm">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold font-headline text-accent">R{product.price.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Incl. VAT</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center border-2 border-border rounded bg-background h-11 shrink-0 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Button variant="ghost" size="icon" className="h-full w-10" onClick={() => handleQuantityChange(-1)} disabled={isOutOfStock}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        className="w-12 text-center border-0 shadow-none focus-visible:ring-0 text-base font-bold bg-transparent"
                        value={quantity}
                        readOnly={isOutOfStock}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <Button variant="ghost" size="icon" className="h-full w-10" onClick={() => handleQuantityChange(1)} disabled={isOutOfStock}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      size="lg"
                      className="flex-grow h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                      disabled={isOutOfStock}
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {added ? 'Added ✓' : isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-1">
                    {isOutOfStock ? (
                      <span className="font-medium uppercase tracking-wider text-destructive">Temporarily Unavailable</span>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium uppercase tracking-wider">In Stock & Ready to Ship</span>
                      </>
                    )}
                  </div>

                  <div className="pt-2 border-t border-dashed border-border text-center">
                    <a
                      href={waOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex-wrap justify-center"
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>Questions? <span className="underline underline-offset-2">WhatsApp the team</span></span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <ShareButtons url={shareUrl} title={product.name} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Field Application ─────────────────────────────────────── */}
      {product.fieldUse && (
        <section id="field-use" className="py-14 md:py-20 bg-surface border-y border-border">
          <div className="container max-w-4xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-primary/20 pb-4">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-2xl md:text-3xl font-bold font-headline">Field Application & Use</h2>
              </div>
              <div className="bg-background border border-border p-6 md:p-8 rounded-lg shadow-sm">
                <div className="text-base md:text-lg text-muted-foreground font-body">
                  {renderFormattedText(product.fieldUse)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ──────────────────────────────────────────── */}
      {product.howItWorks && (
        <section id="how-it-works" className="py-14 md:py-20 border-b border-border">
          <div className="container max-w-4xl">
            <div className="space-y-6">
              <div className="border-b-2 border-primary/20 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold font-headline">How It Works</h2>
              </div>
              <div className="text-base md:text-lg text-muted-foreground font-body">
                {renderFormattedText(product.howItWorks)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Specifications Table ───────────────────────────────────── */}
      {product.specifications && product.specifications.length > 0 && (
        <section className="py-14 md:py-20">
          <div className="container max-w-3xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold font-headline inline-block border-b-4 border-accent pb-2">
                Technical Specifications
              </h2>
            </div>
            <div className="border-2 border-border rounded overflow-hidden shadow-sm overflow-x-auto">
              <Table>
                <TableBody>
                  {product.specifications.map((spec, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-surface' : 'bg-background'}>
                      <TableCell className="font-bold text-primary py-4 pl-5 uppercase tracking-wider text-xs w-2/5 border-r align-top">
                        {spec.feature}
                      </TableCell>
                      <TableCell className="py-4 pr-5 text-foreground font-body text-sm">
                        {spec.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {product.calibrationNote && (
              <div className="mt-6 bg-amber-50 border-2 border-amber-200 p-5 rounded-md shadow-sm">
                <div className="flex items-center gap-2 text-amber-800 font-bold mb-3 uppercase tracking-widest text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Calibration Note</span>
                </div>
                <div className="text-sm text-amber-900 font-body leading-relaxed">
                  {renderFormattedText(product.calibrationNote)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Authority Statement ───────────────────────────────────── */}
      {product.authorityStatement && (
        <section className="bg-surface py-14 md:py-20 border-y border-border">
          <div className="container px-4 max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-6 opacity-70 text-muted-foreground">
              Expert Recommendation
            </p>
            <blockquote className="text-xl md:text-3xl font-headline italic leading-relaxed text-foreground">
              "{product.authorityStatement.split('\n')[0].replace(/["""]/g, '')}"
            </blockquote>
            <div className="h-1 w-16 bg-accent mx-auto my-6" />
            <div className="text-muted-foreground font-body max-w-xl mx-auto italic text-sm md:text-base">
              {renderFormattedText(product.authorityStatement.split('\n').slice(1).join('\n'))}
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-12 border-t border-border text-center bg-background">
        <div className="container">
          <p className="text-muted-foreground mb-5 text-sm uppercase tracking-widest font-semibold">Ready to order?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-md"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {added ? 'Added to Cart ✓' : isOutOfStock ? 'Currently Unavailable' : `Add to Cart — R${product.price.toFixed(2)}`}
            </Button>
            <a
              href={waOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <WhatsAppIcon className="h-4 w-4 shrink-0" />
              Order via WhatsApp
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-5 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Info className="h-3.5 w-3.5 text-primary shrink-0" /> Secured by PayFast</span>
            <span className="flex items-center gap-1"><Info className="h-3.5 w-3.5 text-primary shrink-0" /> Nationwide Delivery</span>
          </div>
        </div>
      </section>

      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />

      {/* ── Sticky mobile CTA (only visible after purchase box scrolls out) ── */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background border-t-2 border-border shadow-xl transition-transform duration-300 ${showStickyCTA ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="container py-3 flex items-center gap-4">
          <div className="shrink-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold leading-none mb-0.5">Price</p>
            <p className="text-xl font-bold text-accent font-headline leading-none">R{product.price.toFixed(2)}</p>
          </div>
          <Button
            size="lg"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-11"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {added ? 'Added to Cart ✓' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind sticky bar when it's visible */}
      <div className="h-20 lg:hidden" />

    </div>
  );
}
