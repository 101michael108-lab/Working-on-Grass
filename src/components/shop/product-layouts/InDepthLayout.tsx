
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import RelatedProducts from '../RelatedProducts';
import { useCart } from '@/context/cart-context';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, Info } from 'lucide-react';
import { ProductImageGallery } from '../ProductImageGallery';

export default function InDepthLayout({ product, relatedProducts, isLoadingRelated }: { product: Product, relatedProducts: Product[], isLoadingRelated: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  return (
    <div className="bg-background">
      {/* 1. Hero Section */}
      <section className="bg-secondary/30 border-b">
        <div className="container py-12 md:py-24">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7">
                    <ProductImageGallery images={product.images || []} productName={product.name} />
                </div>
                <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-4">
                        <Badge variant="outline" className="px-3 py-1 text-xs uppercase tracking-widest">{product.category}</Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline leading-tight">{product.name}</h1>
                        {product.valueProposition && (
                            <p className="text-xl md:text-2xl text-muted-foreground font-body leading-relaxed">
                                {product.valueProposition}
                            </p>
                        )}
                    </div>
                    
                    <div className="bg-card border rounded-2xl p-8 shadow-sm">
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-4xl font-bold text-accent">R{product.price.toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground uppercase font-semibold">Incl. VAT</span>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border rounded-lg h-12">
                                    <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(-1)}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input 
                                        type="number" 
                                        className="w-16 text-center border-0 shadow-none focus-visible:ring-0 text-lg font-semibold" 
                                        value={quantity} 
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                                    />
                                    <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button size="lg" className="flex-grow h-12 bg-accent text-accent-foreground hover:bg-accent/90 text-lg shadow-md" onClick={() => addToCart(product, quantity)}>
                                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                                <Info className="h-3 w-3" />
                                <span>Fast shipping across Southern Africa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. Problem / Benefit Section */}
      <section className="py-20 md:py-32">
        <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-8">Why the {product.name} Matters</h2>
            <div 
                className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body space-y-6" 
                dangerouslySetInnerHTML={{ __html: product.description.replace(/•/g, '<br /><span class="text-primary font-bold mr-2">•</span>') }}
            />
        </div>
      </section>

      {/* 3. How It Works Section */}
      {product.howItWorks && (
        <section id="how-it-works" className="py-20 md:py-32 bg-secondary/30">
            <div className="container">
                <div className="max-w-4xl mx-auto">
                     <div className="text-center space-y-6">
                        <Badge className="bg-primary/10 text-primary border-none hover:bg-primary/10">In Action</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline">How It Works</h2>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body italic">
                            "{product.howItWorks}"
                        </p>
                     </div>
                </div>
            </div>
        </section>
      )}

      {/* 4. Technical Details Section */}
      {product.specifications && product.specifications.length > 0 && (
         <section className="py-20 md:py-32">
            <div className="container max-w-3xl mx-auto">
                 <h2 className="text-3xl font-bold font-headline text-center mb-12">Technical Specifications</h2>
                 <div className="border rounded-2xl overflow-hidden shadow-sm">
                    <Table>
                        <TableBody>
                            {product.specifications.map((spec, index) => (
                                <TableRow key={index} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                                    <TableCell className="font-bold text-foreground/80 py-4 pl-6 uppercase tracking-wider text-xs">{spec.feature}</TableCell>
                                    <TableCell className="py-4 pr-6 text-muted-foreground">{spec.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
            </div>
        </section>
      )}
      
      {/* 5. Authority Section */}
      {product.authorityStatement && (
        <section className="bg-primary text-primary-foreground py-20 md:py-32">
            <div className="container text-center px-4">
                 <blockquote className="text-2xl md:text-4xl font-headline italic leading-snug max-w-4xl mx-auto">
                    "{product.authorityStatement}"
                </blockquote>
                <div className="mt-8 h-1 w-20 bg-accent mx-auto" />
            </div>
        </section>
      )}

      {/* 6. Repeated CTA */}
       <section className="py-20 md:py-32 border-t text-center">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Ready to improve your land management?</h2>
             <p className="mt-2 max-w-2xl mx-auto text-muted-foreground text-lg mb-10">
                Join hundreds of farmers and land managers using the {product.name}.
            </p>
            <div className="flex flex-col items-center gap-4">
                <Button size="lg" className="h-14 px-12 bg-accent text-accent-foreground hover:bg-accent/90 text-xl font-bold shadow-xl" onClick={() => addToCart(product, quantity)}>
                    <ShoppingCart className="mr-2 h-6 w-6" /> Add to Cart — R{product.price.toFixed(2)}
                </Button>
            </div>
          </div>
      </section>

      {/* 7. Related Resources / Products */}
      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />

    </div>
  );
}
