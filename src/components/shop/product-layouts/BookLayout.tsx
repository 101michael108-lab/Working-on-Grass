
"use client";

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, Check, BookOpen, ScrollText, Users } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import RelatedProducts from '../RelatedProducts';
import { ProductImageGallery } from '../ProductImageGallery';

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

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  return (
    <div className="bg-background">
      {/* 1. Publication Header */}
      <section className="bg-muted/20 border-b-2 border-border">
        <div className="container py-12 md:py-20 grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
                <ProductImageGallery images={product.images || []} productName={product.name} />
            </div>
            <div className="lg:col-span-7 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary/70">{product.category}</span>
                        <span className="h-1 w-1 rounded-full bg-primary/30" />
                        <span className="text-xs font-bold uppercase tracking-widest text-accent">Essential Field Guide</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline leading-tight">{product.name}</h1>
                    <div className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body">
                        {renderFormattedText(product.description)}
                    </div>
                </div>
                
                <div className="bg-background border-2 border-border p-8 rounded-lg max-w-md shadow-sm">
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-4xl font-bold font-headline text-accent">R{product.price.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Hardcover Edition</span>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border-2 border-border rounded h-12 bg-white">
                                <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(-1)}><Minus className="h-4 w-4" /></Button>
                                <Input 
                                    type="number" 
                                    className="w-16 text-center border-0 shadow-none focus-visible:ring-0 text-lg font-bold bg-transparent" 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                                />
                                <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(1)}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <Button size="lg" className="flex-grow h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold shadow-md" onClick={() => addToCart(product, quantity)}>
                                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. Publication Details & Audience */}
      <section className="py-16 md:py-24">
        <div className="container grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7 space-y-16">
                {/* Key Features */}
                {product.features && product.features.length > 0 && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b-2 border-primary/10 pb-4">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <h2 className="text-3xl font-bold font-headline">Key Features</h2>
                        </div>
                        <ul className="grid sm:grid-cols-1 gap-4">
                            {product.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3 bg-muted/20 p-4 rounded border-l-4 border-primary">
                                    <Check className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                                    <span className="text-foreground/80 font-body font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Who It's For */}
                {product.targetAudience && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b-2 border-accent/10 pb-4">
                            <Users className="h-6 w-6 text-accent" />
                            <h2 className="text-3xl font-bold font-headline">Who It's For</h2>
                        </div>
                        <div className="bg-accent/5 border-2 border-accent/10 p-8 rounded-lg">
                            <div className="text-lg text-muted-foreground font-body">
                                {renderFormattedText(product.targetAudience)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Publication Specs Sidebar */}
            {product.specifications && product.specifications.length > 0 && (
                <div className="lg:col-span-5 space-y-8">
                    <div className="flex items-center gap-3 border-b-2 border-border pb-4">
                        <ScrollText className="h-6 w-6 text-muted-foreground" />
                        <h3 className="text-3xl font-bold font-headline">Publication Info</h3>
                    </div>
                    <div className="border-2 border-border rounded overflow-hidden shadow-sm bg-white">
                        <Table>
                            <TableBody>
                                {product.specifications.map((spec, index) => (
                                    <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/30' : 'bg-white'}>
                                        <TableCell className="font-bold text-primary/70 py-4 pl-6 uppercase tracking-wider text-[10px] w-1/3 border-r">
                                            {spec.feature}
                                        </TableCell>
                                        <TableCell className="py-4 pr-6 text-foreground font-body font-medium">
                                            {spec.description}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="p-6 bg-secondary/20 rounded-md border-2 border-dashed border-border text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Technical Standard</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Peer-reviewed and field-tested for maximum reliability in Southern African ecological conditions.
                        </p>
                    </div>
                </div>
            )}
        </div>
      </section>
      
      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />

    </div>
  );
}
