
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import {
  Minus, Plus, ShoppingCart, Check, BookOpen, Users, Wrench,
  MapPin, AlertCircle, AlertTriangle, Smartphone, ArrowRight,
  CheckCircle2, Tag,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import type { Product, EnabledSections } from '@/lib/types';
import RelatedProducts from '../RelatedProducts';
import { ProductImageGallery } from '../ProductImageGallery';
import Link from 'next/link';
import { ShareButtons } from '@/components/share-buttons';

const WA_NUMBER = "27782280008";

// ─── Backwards compat ─────────────────────────────────────────────────────────
function getEnabledSections(product: Product): EnabledSections {
  if (product.enabledSections) return product.enabledSections;
  if (product.layout === 'in-depth') {
    return {
      howItWorks: !!product.howItWorks,
      fieldApplication: !!product.fieldUse,
      specifications: !!(product.specifications?.length),
      expertRecommendation: !!product.authorityStatement,
      valueProposition: !!product.valueProposition,
      calibrationNote: !!product.calibrationNote,
    };
  }
  if (product.layout === 'book') {
    return {
      longDescription: !!product.longDescription,
      whatsInside: !!(product.features?.length),
      whoItsFor: !!product.targetAudience,
    };
  }
  return {};
}

// ─── Rich text renderer ───────────────────────────────────────────────────────
function RichText({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <div className={className}>
      {text.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          return (
            <div key={i} className="flex items-start gap-3 mb-3">
              <span className="mt-[0.5em] h-1.5 w-1.5 bg-primary flex-shrink-0" />
              <span className="leading-relaxed">{trimmed.substring(1).trim()}</span>
            </div>
          );
        }
        return <p key={i} className="mb-4 leading-relaxed last:mb-0">{line}</p>;
      })}
    </div>
  );
}

// ─── Section heading — plain rule + label, no icon boxes ─────────────────────
function SectionHeading({
  label,
  centered = false,
}: {
  label: string;
  centered?: boolean;
}) {
  if (centered) {
    return (
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold font-headline">{label}</h2>
        <div className="h-0.5 w-10 bg-accent mx-auto mt-3" />
      </div>
    );
  }
  return (
    <h2 className="text-2xl md:text-3xl font-bold font-headline mb-7 pb-4 border-b border-border">
      {label}
    </h2>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductPage({
  product,
  relatedProducts,
  isLoadingRelated,
}: {
  product: Product;
  relatedProducts: Product[];
  isLoadingRelated: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [shareUrl, setShareUrl] = useState('');
  const [added, setAdded] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const purchaseBoxRef = useRef<HTMLDivElement>(null);

  const sections = getEnabledSections(product);
  const isBook = product.category === 'Books & Field Guides';
  const isOutOfStock = (product.stock ?? 0) <= 0;

  useEffect(() => { setShareUrl(window.location.href); }, []);

  useEffect(() => {
    const el = purchaseBoxRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyCTA(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleAddToCart = useCallback(() => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [addToCart, product, quantity]);

  const handleQtyChange = (n: number) => setQuantity(Math.max(1, n));

  const show = {
    longDescription:      sections.longDescription      && !!product.longDescription,
    whatsInside:          sections.whatsInside          && !!(product.features?.length),
    whoItsFor:            sections.whoItsFor            && !!product.targetAudience,
    howItWorks:           sections.howItWorks           && !!product.howItWorks,
    fieldApplication:     sections.fieldApplication     && !!product.fieldUse,
    specifications:       sections.specifications       && !!(product.specifications?.length),
    expertRecommendation: sections.expertRecommendation && !!product.authorityStatement,
    valueProposition:     sections.valueProposition     && !!product.valueProposition,
    calibrationNote:      sections.calibrationNote      && !!product.calibrationNote,
  };

  const hasBodySections = show.longDescription || show.whatsInside || show.whoItsFor ||
    show.howItWorks || show.fieldApplication || show.specifications || show.expertRecommendation;

  const waOrderUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi, I'd like to order the ${product.name}.`)}`;

  return (
    <div className="bg-background overflow-x-hidden">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="container py-10 md:py-16">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">

            <div className="lg:col-span-6">
              <ProductImageGallery images={product.images || []} productName={product.name} />
            </div>

            <div className="lg:col-span-6 space-y-6">
              {/* Category + stock */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Link
                  href={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
                >
                  <Tag className="h-3 w-3" />
                  {product.category}
                </Link>
                {isOutOfStock && (
                  <span className="flex items-center gap-1 text-xs font-bold text-destructive uppercase tracking-widest">
                    <AlertTriangle className="h-3 w-3" /> Out of Stock
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline leading-tight">
                {product.name}
              </h1>

              {/* Short description */}
              {product.description && (
                <p className="text-base md:text-lg text-foreground/70 font-body leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Purchase box */}
              <div ref={purchaseBoxRef} className="border border-border bg-surface p-5 space-y-4">
                <div className="flex items-baseline gap-2 pb-4 border-b border-border">
                  <span className="text-4xl font-bold font-headline text-accent">
                    R{product.price.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Incl. VAT
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`flex items-center border border-border rounded h-11 bg-background shrink-0 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Button variant="ghost" size="icon" className="h-full w-9 rounded-none border-r border-border" onClick={() => handleQtyChange(quantity - 1)} disabled={isOutOfStock}>
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Input
                      type="number"
                      className="w-10 text-center border-0 shadow-none focus-visible:ring-0 text-base font-bold bg-transparent p-0 rounded-none"
                      value={quantity}
                      readOnly={isOutOfStock}
                      onChange={e => handleQtyChange(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <Button variant="ghost" size="icon" className="h-full w-9 rounded-none border-l border-border" onClick={() => handleQtyChange(quantity + 1)} disabled={isOutOfStock}>
                      <Plus className="h-3.5 w-3.5" />
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

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {isOutOfStock ? (
                    <span className="text-destructive font-semibold uppercase tracking-wider">Temporarily Unavailable</span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      In Stock & Ready to Ship
                    </span>
                  )}
                  <a
                    href={waOrderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    <span className="underline underline-offset-2">WhatsApp us</span>
                  </a>
                </div>
              </div>

              <ShareButtons url={shareUrl} title={product.name} />
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITION ────────────────────────────────────────────────── */}
      {show.valueProposition && (
        <section className="bg-primary text-primary-foreground py-7 md:py-9 border-b border-primary">
          <div className="container max-w-3xl text-center">
            <p className="text-lg md:text-xl font-headline font-bold leading-relaxed">
              {product.valueProposition}
            </p>
          </div>
        </section>
      )}

      {/* ── LONG DESCRIPTION ─────────────────────────────────────────────────── */}
      {show.longDescription && (
        <section className="py-14 md:py-20 border-b border-border">
          <div className="container max-w-3xl">
            <RichText
              text={product.longDescription!}
              className="text-base md:text-lg font-body text-foreground/80"
            />
          </div>
        </section>
      )}

      {/* ── WHAT'S INSIDE + WHO IT'S FOR ─────────────────────────────────────── */}
      {(show.whatsInside || show.whoItsFor) && (
        <section className="py-14 md:py-20 bg-surface border-b border-border">
          <div className="container">
            <div className={`grid gap-14 lg:gap-16 ${show.whatsInside && show.whoItsFor ? 'lg:grid-cols-[3fr_2fr]' : ''}`}>

              {show.whatsInside && (
                <div>
                  <SectionHeading label="What's Inside" />
                  <ul className="space-y-2">
                    {product.features!.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 py-3 px-4 bg-background border-l-4 border-primary/20 hover:border-primary/50 transition-colors">
                        <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <span className="text-foreground/80 font-body leading-relaxed text-sm md:text-base">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {show.whoItsFor && (
                <div>
                  <SectionHeading label="Who It's For" />
                  <RichText
                    text={product.targetAudience!}
                    className="text-sm md:text-base font-body text-foreground/75"
                  />
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      {show.howItWorks && (
        <section className="py-14 md:py-20 border-b border-border">
          <div className="container max-w-3xl">
            <SectionHeading label="How It Works" />
            <RichText
              text={product.howItWorks!}
              className="text-base md:text-lg font-body text-foreground/80"
            />
          </div>
        </section>
      )}

      {/* ── FIELD APPLICATION ────────────────────────────────────────────────── */}
      {show.fieldApplication && (
        <section className="py-14 md:py-20 bg-surface border-b border-border">
          <div className="container max-w-3xl">
            <SectionHeading label="Field Application & Use" />
            <RichText
              text={product.fieldUse!}
              className="text-base md:text-lg font-body text-foreground/80"
            />
          </div>
        </section>
      )}

      {/* ── TECHNICAL SPECIFICATIONS ──────────────────────────────────────────── */}
      {show.specifications && (
        <section className="py-14 md:py-20 border-b border-border">
          <div className="container max-w-3xl">
            <SectionHeading label="Technical Specifications" centered />
            <div className="border border-border overflow-hidden">
              <Table>
                <TableBody>
                  {product.specifications!.map((spec, i) => (
                    <TableRow key={i} className={i % 2 === 0 ? 'bg-surface' : 'bg-background'}>
                      <TableCell className="font-bold text-primary py-4 pl-6 uppercase tracking-wide text-xs w-2/5 border-r border-border align-top">
                        {spec.feature}
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-foreground/80 font-body text-sm leading-relaxed">
                        {spec.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {show.calibrationNote && (
              <div className="mt-6 flex gap-4 bg-amber-50 border border-amber-300 p-5">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">
                    Calibration Note
                  </p>
                  <RichText text={product.calibrationNote!} className="text-sm text-amber-900 font-body" />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Calibration note standalone */}
      {show.calibrationNote && !show.specifications && (
        <section className="py-10 border-b border-border">
          <div className="container max-w-3xl">
            <div className="flex gap-4 bg-amber-50 border border-amber-300 p-5">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">
                  Calibration Note
                </p>
                <RichText text={product.calibrationNote!} className="text-sm text-amber-900 font-body" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── EXPERT RECOMMENDATION ────────────────────────────────────────────── */}
      {show.expertRecommendation && (() => {
        const lines = (product.authorityStatement || '').split('\n').filter(Boolean);
        const quote = lines[0]?.replace(/["""]/g, '').trim();
        const attribution = lines.slice(1).join('\n').trim();
        return (
          <section className="py-16 md:py-24 bg-surface border-b border-border">
            <div className="container max-w-2xl text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-muted-foreground">
                Expert Recommendation
              </p>
              <blockquote className="text-xl md:text-2xl lg:text-3xl font-headline italic leading-relaxed text-foreground">
                &ldquo;{quote}&rdquo;
              </blockquote>
              {attribution && (
                <>
                  <div className="h-px w-10 bg-accent mx-auto my-7" />
                  <p className="text-muted-foreground font-body text-sm md:text-base">
                    {attribution}
                  </p>
                </>
              )}
            </div>
          </section>
        );
      })()}

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      {hasBodySections && (
        <section className="py-14 bg-background border-b border-border text-center">
          <div className="container">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">
              Ready to order?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
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
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> Secured by PayFast
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> Nationwide Delivery
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── GRASSSPRO CROSS-SELL ──────────────────────────────────────────────── */}
      {isBook && (
        <section className="py-10 bg-surface border-b border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-5 bg-background border border-border p-6">
              <div className="shrink-0 text-primary">
                <Smartphone className="h-8 w-8" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">
                  Companion App
                </p>
                <h3 className="font-headline font-bold text-lg">
                  Take it further with GrassPro
                </h3>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  The GrassPro app covers the same 390 species with 1,400+ diagnostic images, GPS filtering, and Smart Search — built to use alongside this book. Free to download.
                </p>
              </div>
              <Link href="/grassPro" className="shrink-0">
                <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-4 py-2.5 hover:bg-primary/90 transition-colors whitespace-nowrap">
                  Learn More <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />

      {/* ── STICKY MOBILE CTA ────────────────────────────────────────────────── */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background border-t border-border shadow-lg transition-transform duration-300 ${showStickyCTA ? 'translate-y-0' : 'translate-y-full'}`}>
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

      <div className="h-20 lg:hidden" />
    </div>
  );
}
