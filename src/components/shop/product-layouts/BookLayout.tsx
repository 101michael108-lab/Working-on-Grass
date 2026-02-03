
"use client";

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, Check, BookOpen, ScrollText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import RelatedProducts from '../RelatedProducts';
import { ProductImageGallery } from '../ProductImageGallery';

export default function BookLayout({ product, relatedProducts, isLoadingRelated }: { product: Product, relatedProducts: Product[], isLoadingRelated: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  return (
    <div className="bg-background">
      {/* 1. Hero Section */}
      <section className="bg-secondary/30 border-b">
        <div className="container py-12 md:py-24 grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
                <ProductImageGallery images={product.images || []} productName={product.name} />
            </div>
            <div className="lg:col-span-6 space-y-8">
                <div className="space-y-4">
                    <Badge variant="outline" className="px-3 py-1 uppercase tracking-widest text-xs font-semibold">{product.category}</Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline leading-tight">{product.name}</h1>
                    {product.description && <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body">{product.description}</p>}
                </div>
                
                <div className="bg-card border rounded-2xl p-8 shadow-sm max-w-md">
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-4xl font-bold text-accent">R{product.price.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Hardcover / Print</span>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border rounded-lg h-12">
                                <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(-1)}><Minus className="h-4 w-4" /></Button>
                                <Input type="number" className="w-16 text-center border-0 shadow-none focus-visible:ring-0 text-lg font-semibold" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                                <Button variant="ghost" size="icon" className="h-full w-12" onClick={() => handleQuantityChange(1)}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <Button size="lg" className="flex-grow h-12 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md text-lg" onClick={() => addToCart(product, quantity)}>
                                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. Features & Details Section */}
      <section className="py-20 md:py-32">
        <div className="container grid lg:grid-cols-12 gap-16">
            {product.features && product.features.length > 0 && (
                <div className="lg:col-span-7 space-y-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold font-headline">Key Features</h2>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-6">
                        {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3 bg-secondary/30 p-4 rounded-xl border border-transparent hover:border-primary/20 transition-colors">
                                <Check className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                                <span className="text-muted-foreground font-body">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
             {product.specifications && product.specifications.length > 0 && (
                 <div className="lg:col-span-5 space-y-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-accent/10 p-3 rounded-xl">
                            <ScrollText className="h-6 w-6 text-accent" />
                        </div>
                        <h3 className="text-3xl font-bold font-headline">Book Details</h3>
                    </div>
                     <div className="border rounded-2xl overflow-hidden shadow-sm">
                        <Table>
                            <TableBody>
                                {product.specifications.map((spec, index) => (
                                    <TableRow key={index} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                                        <TableCell className="font-bold text-foreground/70 py-4 pl-6 uppercase tracking-wider text-xs">{spec.feature}</TableCell>
                                        <TableCell className="py-4 pr-6 text-muted-foreground font-body">{spec.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                </div>
             )}
        </div>
      </section>
      
      {/* 3. Related Products */}
      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />

    </div>
  );
}
