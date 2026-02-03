
"use client";

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, ShieldCheck, Truck, Tag, Info } from 'lucide-react';
import type { Product } from '@/lib/types';
import RelatedProducts from '../RelatedProducts';
import { ProductImageGallery } from '../ProductImageGallery';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

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
            {/* Image Gallery */}
            <div className="lg:col-span-7">
                <ProductImageGallery images={product.images || []} productName={product.name} />
            </div>

            {/* Product Info */}
            <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4 border-b-2 border-border pb-6">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                        <Tag className="h-3 w-3" />
                        {product.category}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight">
                        {product.name}
                    </h1>
                    {product.brand && (
                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                            Brand: {product.brand}
                        </p>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-bold font-headline text-accent">
                            R{product.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground uppercase font-bold">
                            Incl. VAT
                        </span>
                    </div>

                    <div className="text-lg text-foreground/80 font-body leading-relaxed whitespace-pre-line">
                        {product.description}
                    </div>
                </div>
                
                {/* Technical Specifications - For the "Farmer-Made" Technical Feel */}
                {product.specifications && product.specifications.length > 0 && (
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-bold font-headline border-b pb-2">Technical Specifications</h3>
                        <div className="border rounded-md overflow-hidden bg-white/50 shadow-sm">
                            <Table>
                                <TableBody>
                                    {product.specifications.map((spec, index) => (
                                        <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                                            <TableCell className="font-bold text-primary/80 py-3 pl-4 uppercase tracking-wider text-[10px] w-1/3">
                                                {spec.feature}
                                            </TableCell>
                                            <TableCell className="py-3 pr-4 text-sm font-medium">
                                                {spec.description}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
                
                {/* Functional Action Area */}
                <div className="bg-secondary/30 border-2 border-border p-8 rounded-md space-y-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center border-2 border-border rounded bg-background h-12">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-full w-12 rounded-none border-r" 
                                onClick={() => handleQuantityChange(-1)}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                                type="number" 
                                className="w-16 text-center border-0 shadow-none focus-visible:ring-0 text-lg font-bold bg-transparent" 
                                value={quantity} 
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                            />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-full w-12 rounded-none border-l" 
                                onClick={() => handleQuantityChange(1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button 
                            size="lg" 
                            className="flex-grow w-full sm:w-auto h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold shadow-md" 
                            onClick={() => addToCart(product, quantity)}
                        >
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
