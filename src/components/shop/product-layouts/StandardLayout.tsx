
"use client";

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, ShieldCheck, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
      <div className="container py-12 md:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            <div className="lg:col-span-7">
                <ProductImageGallery images={product.images || []} productName={product.name} />
            </div>
            <div className="lg:col-span-5 space-y-10">
                <div className="space-y-4 border-b pb-8">
                    <Badge variant="outline" className="px-3 py-1 uppercase tracking-widest text-xs font-semibold text-primary border-primary/30">{product.category}</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight">{product.name}</h1>
                    {product.brand && <p className="text-sm text-muted-foreground font-semibold">Brand: {product.brand}</p>}
                </div>

                <div className="space-y-6">
                    <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-bold text-accent">R{product.price.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground uppercase font-semibold">Incl. VAT</span>
                    </div>

                    <div className="prose prose-zinc text-muted-foreground font-body leading-relaxed max-w-none">
                        <p>{product.description}</p>
                    </div>
                </div>
                
                <div className="bg-card border rounded-2xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-lg h-12 bg-background">
                            <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(-1)}><Minus className="h-4 w-4" /></Button>
                            <Input 
                                type="number" 
                                className="w-16 text-center border-0 shadow-none focus-visible:ring-0 text-lg font-bold" 
                                value={quantity} 
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                            />
                            <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                        <Button size="lg" className="flex-grow h-12 bg-accent text-accent-foreground hover:bg-accent/90 text-lg shadow-md font-bold transition-all hover:scale-[1.02]" onClick={() => addToCart(product, quantity)}>
                            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Truck className="h-4 w-4 text-primary" />
                            <span>Nationwide Delivery</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span>Expert Approved</span>
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
