
"use client";

import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, Check, BookOpen, Users, AlertTriangle, Smartphone, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import type { Product } from '@/lib/types';
import RelatedProducts from '../RelatedProducts';
import { ProductImageGallery } from '../ProductImageGallery';
import Link from 'next/link';
import { ShareButtons } from '@/components/share-buttons';

const WA_NUMBER = "27782280008";

const renderFormattedText = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-3" />;
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const content = trimmed.substring(1).trim();
      return (
        <div key={i} className="flex items-start gap-3 mb-3 pl-2">
          <span className="text-primary font-bold mt-1.5 flex-shrink-0 text-xs">•</span>
          <span className="text-foreground/80 leading-relaxed">{content}</span>
        </div>
      );
    }
    return <p key={i} className="mb-4 text-foreground/80 leading-relaxed">{line}</p>;
  });
};

export default function BookLayout({ product, relatedProducts, isLoadingRelated }: { product: Product, relatedProducts: Product[], isLoadingRelated: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [shareUrl, setShareUrl] = useState('');
  const [added, setAdded] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const purchaseBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

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

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const waOrderUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi, I have a question about ordering the ${product.name}.`)}`;

  return (
    <div className="bg-background overflow-x-hidden">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="container py-10 md:py-16">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Image */}
            <div className="lg:col-span-5">
              <ProductImageGallery images={product.images || []} productName={product.name} />
            </div>

            {/* Content */}
            <div className="lg:col-span-7 space-y-5">
              {/* Category breadcrumb + stock badge */}
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

              {/* Title + subtitle */}
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline leading-tight">
                  {product.name}
                </h1>
                {product.subtitle && (
                  <p className="mt-2 text-lg text-muted-foreground font-body italic">
                    {product.subtitle}
                  </p>
                )}
              </div>

              {/* Short description / tagline */}
              {product.description && (
                <p className="text-base text-foreground/75 font-body leading-relaxed border-l-4 border-primary/20 pl-4">
                  {product.description}
                </p>
              )}

              {/* Purchase box */}
              <div ref={purchaseBoxRef} className="bg-background border-2 border-border rounded-lg p-5 max-w-md shadow-sm">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold font-headline text-accent">R{product.price.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Incl. VAT</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center border-2 border-border rounded h-11 bg-white shrink-0 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Button variant="ghost" size="icon" className="h-full w-8 sm:w-10" onClick={() => handleQuantityChange(-1)} disabled={isOutOfStock}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        className="w-9 sm:w-12 text-center border-0 shadow-none focus-visible:ring-0 text-base font-bold bg-transparent"
                        value={quantity}
                        readOnly={isOutOfStock}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <Button variant="ghost" size="icon" className="h-full w-8 sm:w-10" onClick={() => handleQuantityChange(1)} disabled={isOutOfStock}>
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
                  <div className="pt-1 text-center">
                    <a
                      href={waOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5" />
                      Questions? <span className="underline underline-offset-2">WhatsApp the team</span>
                    </a>
                  </div>
                </div>
              </div>

              <ShareButtons url={shareUrl} title={product.name} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Long Description (editorial body) ───────────────────────── */}
      {product.longDescription && (
        <section className="py-14 md:py-20 border-b border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="prose-like text-base font-body">
                {renderFormattedText(product.longDescription)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── What's Inside + Who It's For ────────────────────────────── */}
      {(product.features?.length || product.targetAudience) && (
        <section className="py-14 md:py-20">
          <div className="container">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">

              {product.features && product.features.length > 0 && (
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
                    <BookOpen className="h-5 w-5 text-primary shrink-0" />
                    <h2 className="text-2xl font-bold font-headline">What's Inside</h2>
                  </div>
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 bg-surface p-4 rounded border-l-4 border-primary">
                        <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span className="text-foreground/80 font-body">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.targetAudience && (
                <div className={product.features?.length ? "lg:col-span-5" : "lg:col-span-7"}>
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 border-b border-accent/10 pb-4">
                      <Users className="h-5 w-5 text-accent shrink-0" />
                      <h2 className="text-2xl font-bold font-headline">Who It's For</h2>
                    </div>
                    <div className="bg-accent/5 border border-accent/15 p-6 rounded-lg">
                      <div className="text-base text-muted-foreground font-body">
                        {renderFormattedText(product.targetAudience)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ── GrassPro Cross-sell ──────────────────────────────────────── */}
      <section className="py-10 bg-surface border-t border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-5 bg-background rounded-lg border-2 border-primary/20 p-5 shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full shrink-0">
              <Smartphone className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Companion App</p>
              <h3 className="font-headline font-bold text-lg">Take it further with GrassPro</h3>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                The GrassPro app covers the same 390 species with 1,400+ diagnostic images, GPS filtering, and Smart Search, built to use alongside this book. Free to download.
              </p>
            </div>
            <Link href="/grassPro" className="shrink-0">
              <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-4 py-2.5 rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap">
                Learn More <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />

      {/* ── Sticky mobile CTA ────────────────────────────────────────── */}
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

      <div className="h-20 lg:hidden" />
    </div>
  );
}
