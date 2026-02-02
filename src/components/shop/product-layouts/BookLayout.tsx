
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import RelatedProducts from '../RelatedProducts';

export default function BookLayout({ product, relatedProducts, isLoadingRelated }: { product: Product, relatedProducts: Product[], isLoadingRelated: boolean }) {
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
            <div className="bg-white rounded-lg flex items-center justify-center p-8 aspect-[4/5] shadow-md">
                <Image
                    src={product.image || `https://picsum.photos/seed/${product.id}/400/500`}
                    alt={product.name}
                    width={400}
                    height={500}
                    className="object-contain w-full h-full shadow-lg"
                />
            </div>
            <div className="space-y-4">
                 <Badge variant="outline">{product.category}</Badge>
                 <h1 className="text-4xl md:text-5xl font-bold">{product.name}</h1>
                 {product.description && <p className="text-lg text-muted-foreground">{product.description}</p>}
                
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

      {/* 2. Features & Details Section */}
      <section className="py-16 md:py-24">
        <div className="container grid lg:grid-cols-3 gap-12">
            {product.features && product.features.length > 0 && (
                <div className="lg:col-span-2">
                    <h2 className="text-3xl font-bold mb-6">Key Features</h2>
                    <ul className="space-y-4">
                        {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <Check className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
             {product.specifications && product.specifications.length > 0 && (
                 <div className="lg:col-span-1">
                    <h3 className="text-2xl font-bold mb-6">Book Details</h3>
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
             )}
        </div>
      </section>
      
      {/* 3. Related Products */}
      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />

    </div>
  );
}
