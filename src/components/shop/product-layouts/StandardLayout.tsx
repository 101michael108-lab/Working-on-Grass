
"use client";

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
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
      <div className="container py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <ProductImageGallery images={product.images || []} productName={product.name} />
            <div className="space-y-4">
                 <Badge variant="outline">{product.category}</Badge>
                 <h1 className="text-4xl md:text-5xl font-bold">{product.name}</h1>
                 {product.valueProposition && <p className="text-lg text-muted-foreground">{product.valueProposition}</p>}
                 <div className="prose text-muted-foreground max-w-none">
                    <p>{product.description}</p>
                 </div>
                
                <div className="mt-8 bg-background border rounded-lg p-4">
                    <p className="text-3xl font-bold text-accent mb-4">R{product.price.toFixed(2)}</p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-md">
                            <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)}><Minus className="h-4 w-4" /></Button>
                            <Input type="number" className="w-16 text-center border-0 shadow-none focus-visible:ring-0" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                            <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                        <Button size="lg" className="flex-grow bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => addToCart(product, quantity)}>
                            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />
    </div>
  );
}
