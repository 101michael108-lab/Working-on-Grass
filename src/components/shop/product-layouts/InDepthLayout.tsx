
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import RelatedProducts from '../RelatedProducts';
import { useCart } from '@/context/cart-context';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, Info, CheckCircle2, MapPin, AlertCircle } from 'lucide-react';
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
                        
                        {/* Short Description positioned next to CTA */}
                        <div className="text-lg text-muted-foreground font-body leading-relaxed">
                            {renderFormattedText(product.description)}
                        </div>

                        {product.valueProposition && (
                            <div className="bg-accent/5 border-l-4 border-accent p-4 mt-6">
                                <p className="text-foreground font-body font-bold italic">
                                    {product.valueProposition}
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-muted/30 border-2 border-border p-8 rounded-lg shadow-sm">
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
                                <Button size="lg" className="flex-grow h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold shadow-md" onClick={() => addToCart(product, quantity)}>
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

      {/* 2. Field Application Section */}
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
                        <div className="text-lg text-muted-foreground font-body">
                            {renderFormattedText(product.fieldUse)}
                        </div>
                    </div>
                 </div>
            </div>
        </section>
      )}

      {/* 3. Operational Instructions Section */}
      {product.howItWorks && (
        <section id="how-it-works" className="py-16 md:py-24 border-b-2 border-primary/5">
            <div className="container max-w-4xl">
                 <div className="space-y-8">
                    <div className="border-b-4 border-primary/20 pb-4">
                        <h2 className="text-3xl font-bold font-headline">Operational Instructions</h2>
                    </div>
                    <div className="text-lg text-muted-foreground font-body">
                        {renderFormattedText(product.howItWorks)}
                    </div>
                 </div>
            </div>
        </section>
      )}

      {/* 4. Specifications Table */}
      {product.specifications && product.specifications.length > 0 && (
         <section className="py-16 md:py-24">
            <div className="container max-w-3xl">
                 <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold font-headline inline-block border-b-4 border-accent pb-2">Technical Specifications</h2>
                 </div>
                 <div className="border-2 border-border rounded overflow-hidden shadow-sm">
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

                 {/* Calibration Note Box */}
                 {product.calibrationNote && (
                    <div className="mt-8 bg-amber-50 border-2 border-amber-200 p-6 rounded-md shadow-sm">
                        <div className="flex items-center gap-2 text-amber-800 font-bold mb-3 uppercase tracking-widest text-xs">
                            <AlertCircle className="h-4 w-4" />
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
      
      {/* 5. Authority Statement */}
      {product.authorityStatement && (
        <section className="bg-primary text-primary-foreground py-16 md:py-24">
            <div className="container text-center px-4 max-w-4xl">
                 <p className="text-xs font-bold uppercase tracking-[0.3em] mb-8 opacity-70 text-primary-foreground/80">Expert Recommendation</p>
                 <div className="space-y-8">
                    <blockquote className="text-2xl md:text-4xl font-headline italic leading-relaxed">
                        "{product.authorityStatement.split('\n')[0]}"
                    </blockquote>
                    <div className="h-1 w-16 bg-accent mx-auto" />
                    <div className="text-primary-foreground/80 font-body max-w-2xl mx-auto">
                        {renderFormattedText(product.authorityStatement.split('\n').slice(1).join('\n'))}
                    </div>
                 </div>
            </div>
        </section>
      )}

      {/* 6. Final CTA Purchase Area */}
       <section className="py-16 md:py-24 border-t-2 border-border text-center bg-muted/10">
          <div className="container">
            <h2 className="text-3xl font-bold font-headline mb-8">Ready for Assessment?</h2>
            <div className="flex flex-col items-center gap-6">
                <Button size="lg" className="h-16 px-12 bg-accent text-accent-foreground hover:bg-accent/90 text-xl font-bold shadow-lg" onClick={() => addToCart(product, quantity)}>
                    <ShoppingCart className="mr-3 h-6 w-6" /> Add to Cart — R{product.price.toFixed(2)}
                </Button>
                <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1"><Info className="h-4 w-4" /> Secured Payment</span>
                    <span className="flex items-center gap-1"><Info className="h-4 w-4" /> Nationwide Delivery</span>
                </div>
            </div>
          </div>
      </section>

      {/* 7. Related Resources */}
      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />

    </div>
  );
}
