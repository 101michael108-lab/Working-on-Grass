
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import RelatedProducts from '../RelatedProducts';
import { useCart } from '@/context/cart-context';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, Info, CheckCircle2, MapPin } from 'lucide-react';
import { ProductImageGallery } from '../ProductImageGallery';

export default function InDepthLayout({ product, relatedProducts, isLoadingRelated }: { product: Product, relatedProducts: Product[], isLoadingRelated: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  return (
    <div className="bg-background">
      {/* 1. Practical Header Section */}
      <section className="border-b-2 border-primary/10">
        <div className="container py-12 md:py-20">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-7">
                    <ProductImageGallery images={product.images || []} productName={product.name} />
                </div>
                <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary/70">{product.category}</span>
                        <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight">{product.name}</h1>
                        {product.valueProposition && (
                            <p className="text-xl text-muted-foreground font-body leading-relaxed border-l-4 border-accent pl-4 italic">
                                {product.valueProposition}
                            </p>
                        )}
                    </div>
                    
                    <div className="bg-muted/30 border-2 border-border p-8 rounded-lg">
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-4xl font-bold font-headline text-accent">R{product.price.toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground uppercase font-semibold">Incl. VAT</span>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border-2 border-border rounded bg-background h-12">
                                    <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(-1)}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input 
                                        type="number" 
                                        className="w-16 text-center border-0 shadow-none focus-visible:ring-0 text-lg font-bold" 
                                        value={quantity} 
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                                    />
                                    <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button size="lg" className="flex-grow h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold" onClick={() => addToCart(product, quantity)}>
                                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span className="font-medium uppercase tracking-wider">In Stock & Field Ready</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. Technical Brief Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
            <div className="mb-12 border-b-4 border-primary/20 pb-4">
                <h2 className="text-3xl font-bold font-headline">Technical Overview</h2>
            </div>
            <div 
                className="text-lg text-foreground/80 leading-relaxed font-body space-y-6 prose prose-zinc max-w-none" 
                dangerouslySetInnerHTML={{ __html: product.description.replace(/•/g, '<br /><span class="text-primary font-bold mr-2">•</span>') }}
            />
        </div>
      </section>

      {/* 3. Field Use Description Section */}
      {product.fieldUse && (
        <section id="field-use" className="py-16 md:py-24 bg-secondary/20 border-y-2 border-primary/5">
            <div className="container max-w-4xl">
                 <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b-4 border-primary/20 pb-4">
                        <MapPin className="h-6 w-6 text-primary" />
                        <h2 className="text-3xl font-bold font-headline">Field Application & Use</h2>
                    </div>
                    <div className="bg-background border-2 border-border p-8 rounded-lg relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 p-2 bg-accent text-white text-[10px] font-bold uppercase tracking-widest">Operator Note</div>
                        <p className="text-lg text-muted-foreground leading-relaxed font-body whitespace-pre-line">
                            {product.fieldUse}
                        </p>
                    </div>
                 </div>
            </div>
        </section>
      )}

      {/* 4. Operational Guide Section */}
      {product.howItWorks && (
        <section id="how-it-works" className="py-16 md:py-24 border-b-2 border-primary/5">
            <div className="container max-w-4xl">
                 <div className="space-y-8">
                    <div className="border-b-4 border-primary/20 pb-4">
                        <h2 className="text-3xl font-bold font-headline">Operational Instructions</h2>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed font-body">
                        {product.howItWorks}
                    </p>
                 </div>
            </div>
        </section>
      )}

      {/* 5. Specifications Table */}
      {product.specifications && product.specifications.length > 0 && (
         <section className="py-16 md:py-24">
            <div className="container max-w-3xl">
                 <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold font-headline inline-block border-b-4 border-accent pb-2">Technical Specifications</h2>
                 </div>
                 <div className="border-2 border-border rounded overflow-hidden">
                    <Table>
                        <TableBody>
                            {product.specifications.map((spec, index) => (
                                <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}>
                                    <TableCell className="font-bold text-primary py-4 pl-6 uppercase tracking-wider text-xs w-1/3">{spec.feature}</TableCell>
                                    <TableCell className="py-4 pr-6 text-foreground font-body">{spec.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
            </div>
        </section>
      )}
      
      {/* 6. Authority Statement */}
      {product.authorityStatement && (
        <section className="bg-primary text-primary-foreground py-16 md:py-20">
            <div className="container text-center px-4 max-w-3xl">
                 <p className="text-xs font-bold uppercase tracking-[0.3em] mb-6 opacity-70 text-primary-foreground/80">Expert Recommendation</p>
                 <blockquote className="text-2xl md:text-3xl font-headline italic leading-relaxed">
                    "{product.authorityStatement}"
                </blockquote>
                <div className="mt-8 h-1 w-16 bg-accent mx-auto" />
            </div>
        </section>
      )}

      {/* 7. Purchase Area */}
       <section className="py-16 md:py-24 border-t-2 border-border text-center bg-muted/10">
          <div className="container">
            <h2 className="text-3xl font-bold font-headline mb-8">Ready for Assessment?</h2>
            <div className="flex flex-col items-center gap-6">
                <Button size="lg" className="h-16 px-12 bg-accent text-accent-foreground hover:bg-accent/90 text-xl font-bold" onClick={() => addToCart(product, quantity)}>
                    <ShoppingCart className="mr-3 h-6 w-6" /> Add to Cart — R{product.price.toFixed(2)}
                </Button>
                <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1"><Info className="h-4 w-4" /> Secured Payment</span>
                    <span className="flex items-center gap-1"><Info className="h-4 w-4" /> Nationwide Delivery</span>
                </div>
            </div>
          </div>
      </section>

      {/* 8. Related Resources */}
      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />

    </div>
  );
}
