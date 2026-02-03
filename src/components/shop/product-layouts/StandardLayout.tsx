"use client";

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, ShieldCheck, Truck, Tag } from 'lucide-react';
import type { Product } from '@/lib/types';
import RelatedProducts from '../RelatedProducts';
import { ProductImageGallery } from '../ProductImageGallery';

export default function StandardLayout({ product, relatedProducts, isLoadingRelated }: { product: Product, relatedProducts: Product[], isLoadingRelated: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  return (
    <div className="bg-background">
      <div className="container py-12 md:py-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-7">
                <ProductImageGallery images={product.images || []} productName={product.name} />
            </div>
            <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4 border-b-2 border-border pb-6">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                        <Tag className="h-3 w-3" />
                        {product.category}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight">{product.name}</h1>
                    {product.brand && <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Manufacturer: {product.brand}</p>}
                </div>

                <div className="space-y-6">
                    <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-bold font-headline text-accent">R{product.price.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground uppercase font-bold">Incl. VAT</span>
                    </div>

                    <div className="text-lg text-foreground/80 font-body leading-relaxed max-w-none">
                        <p>{product.description}</p>
                    </div>
                </div>
                
                <div className="bg-muted/30 border-2 border-border p-8 rounded-lg space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border-2 border-border rounded bg-background h-12">
                            <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(-1)}><Minus className="h-4 w-4" /></Button>
                            <Input 
                                type="number" 
                                className="w-16 text-center border-0 shadow-none focus-visible:ring-0 text-lg font-bold" 
                                value={quantity} 
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                            />
                            <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                        <Button size="lg" className="flex-grow h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold" onClick={() => addToCart(product, quantity)}>
                            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-border border-dashed">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <Truck className="h-4 w-4 text-primary" />
                            <span>Nationwide Shipping</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span>Field Tested</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />
    </div>
  );
}