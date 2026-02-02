
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import RelatedProducts from '../RelatedProducts';
import { useCart } from '@/context/cart-context';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

export default function InDepthLayout({ product, relatedProducts, isLoadingRelated }: { product: Product, relatedProducts: Product[], isLoadingRelated: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  return (
    <div className="bg-background">
      {/* 1. Hero Section */}
      <section className="bg-secondary/30">
        <div className="container py-12 md:py-20 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="bg-white rounded-lg flex items-center justify-center p-8 aspect-square shadow-md">
                <Image
                    src={product.image || `https://picsum.photos/seed/${product.id}/500/500`}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="object-contain w-full h-full"
                />
            </div>
            <div className="space-y-4">
                 <Badge variant="outline">{product.category}</Badge>
                 <h1 className="text-4xl md:text-5xl font-bold">{product.name}</h1>
                 {product.valueProposition && <p className="text-lg text-muted-foreground">{product.valueProposition}</p>}
                
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
      </section>

      {/* 2. Problem / Benefit Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold">Why the {product.name} Matters</h2>
            <div className="mt-4 text-lg text-muted-foreground prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: product.description.replace(/•/g, '<br />•') }}/>
        </div>
      </section>

      {/* 3. How It Works Section */}
      {product.howItWorks && (
        <section id="how-it-works" className="py-16 md:py-24 bg-secondary/30">
            <div className="container">
                <div className="max-w-4xl mx-auto text-center">
                     <h2 className="text-3xl font-bold">How It Works</h2>
                     <div className="mt-4 text-lg text-muted-foreground prose prose-lg max-w-none">
                        <p>{product.howItWorks}</p>
                     </div>
                </div>
            </div>
        </section>
      )}

      {/* 4. Technical Details Section */}
      {product.specifications && product.specifications.length > 0 && (
         <section className="py-16 md:py-24">
            <div className="container max-w-4xl mx-auto">
                 <h2 className="text-3xl font-bold text-center mb-8">Technical Information</h2>
                 <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableBody>
                            {product.specifications.map((spec, index) => (
                                <TableRow key={index} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                                    <TableCell className="font-semibold">{spec.feature}</TableCell>
                                    <TableCell>{spec.description}</TableCell>
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
        <section className="bg-secondary/30">
            <div className="container py-12 text-center">
                 <blockquote className="text-xl italic text-foreground max-w-3xl mx-auto">
                    "{product.authorityStatement}"
                </blockquote>
            </div>
        </section>
      )}

      {/* 6. Repeated CTA */}
       <section className="py-16 md:py-24 border-t">
          <div className="container text-center">
            <h2 className="text-3xl font-bold">Ready to improve your land management?</h2>
             <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
                Add the {product.name} to your cart to get started.
            </p>
            <div className="mt-8">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => addToCart(product, quantity)}>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
            </div>
          </div>
      </section>

      {/* 7. Related Resources / Products */}
      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />

    </div>
  );
}
