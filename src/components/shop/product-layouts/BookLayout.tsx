
"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, Check, BookOpen, Users, AlertTriangle, Smartphone, ArrowRight, MessageCircle } from 'lucide-react';
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
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const content = trimmed.substring(1).trim();
      return (
        <div key={i} className="flex items-start gap-3 mb-3 pl-2">
          <span className="text-primary font-bold mt-1.5 flex-shrink-0 text-xs">•</span>
          <span className="text-foreground/80 leading-relaxed">{content}</span>
        </div>
      );
    }
    return line ? <p key={i} className="mb-4 text-foreground/80 leading-relaxed">{line}</p> : <div key={i} className="h-4" />;
  });
};

export default function BookLayout({ product, relatedProducts, isLoadingRelated }: { product: Product, relatedProducts: Product[], isLoadingRelated: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const waOrderUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi, I have a question about ordering the ${product.name}.`)}`;

  return (
    <div className="bg-background">
      {/* 1. Publication Header */}
      <section className="bg-surface border-b border-border">
        <div className="container py-12 md:py-20 grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
                <ProductImageGallery images={product.images || []} productName={product.name} />
            </div>
            <div className="lg:col-span-7 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link
                              href={`/shop?category=${encodeURIComponent(product.category)}`}
                              className="text-xs font-bold uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
                            >
                              {product.category}
                            </Link>
                        </div>
                        {isOutOfStock && (
                            <span className="flex items-center gap-1 text-xs font-bold text-destructive uppercase tracking-widest">
                                <AlertTriangle className="h-3 w-3" /> Out of Stock
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline leading-tight">{product.name}</h1>
                    <div className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body">
                        {renderFormattedText(product.description)}
                    </div>
                </div>

                <div className="bg-background border-2 border-border p-6 rounded-lg max-w-md shadow-sm">
                    <div className="flex items-baseline gap-2 mb-5">
                        <span className="text-4xl font-bold font-headline text-accent">R{product.price.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Incl. VAT</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center border-2 border-border rounded h-12 bg-white ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                                <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(-1)} disabled={isOutOfStock}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    type="number"
                                    className="w-16 text-center border-0 shadow-none focus-visible:ring-0 text-lg font-bold bg-transparent"
                                    value={quantity}
                                    readOnly={isOutOfStock}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                                <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(1)} disabled={isOutOfStock}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button
                                size="lg"
                                className="flex-grow h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-bold shadow-md"
                                disabled={isOutOfStock}
                                onClick={() => addToCart(product, quantity)}
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" /> {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                            </Button>
                        </div>
                        {/* WhatsApp escape for order questions */}
                        <div className="pt-1 text-center">
                            <a
                                href={waOrderUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Questions about this product? <span className="underline underline-offset-2">WhatsApp the team</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <ShareButtons url={shareUrl} title={product.name} />
                </div>
            </div>
        </div>
      </section>

      {/* 2. Publication Details & Audience */}
      <section className="py-16 md:py-24">
        <div className="container grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7 space-y-16">
                {product.features && product.features.length > 0 && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b-2 border-primary/10 pb-4">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <h2 className="text-3xl font-bold font-headline">Key Features</h2>
                        </div>
                        <ul className="grid sm:grid-cols-1 gap-4">
                            {product.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3 bg-surface p-4 rounded border-l-4 border-primary">
                                    <Check className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                                    <span className="text-foreground/80 font-body font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Who It's For Sidebar */}
            <div className="lg:col-span-5 space-y-8">
                {product.targetAudience && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b-2 border-accent/10 pb-4">
                            <Users className="h-6 w-6 text-accent" />
                            <h2 className="text-3xl font-bold font-headline">Who It's For</h2>
                        </div>
                        <div className="bg-accent/5 border-2 border-accent/10 p-6 rounded-lg">
                            <div className="text-lg text-muted-foreground font-body">
                                {renderFormattedText(product.targetAudience)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </section>

      {/* GrassPro Cross-sell */}
      <section className="py-12 bg-surface border-t border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-6 bg-background rounded-lg border-2 border-primary/20 p-6 shadow-sm">
            <div className="bg-primary/10 p-4 rounded-full shrink-0">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Companion App</p>
              <h3 className="font-headline font-bold text-xl">Take it further with GrassPro</h3>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                The GrassPro app covers the same 320 species with 1,400+ diagnostic images, GPS filtering, and Smart Search — built to use alongside this book in the field. Free to download.
              </p>
            </div>
            <Link href="/grassPro" className="shrink-0">
              <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap">
                Learn More <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />

    </div>
  );
}
