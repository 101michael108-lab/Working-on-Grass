"use client";

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { products } from '@/lib/data';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }
  
  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  return (
    <div className="container py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="bg-secondary/50 rounded-lg flex items-center justify-center p-8">
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="object-contain"
            data-ai-hint={product.imageHint}
          />
        </div>
        <div>
          <Badge variant="outline" className="mb-2">{product.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-accent">
            R{product.price.toFixed(2)}
          </p>
          <div className="mt-6 prose text-muted-foreground max-w-none">
            <p>{product.description}</p>
          </div>
          
          <div className="mt-8 flex items-center gap-4">
             <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                className="w-16 text-center border-0 shadow-none focus-visible:ring-0"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-grow bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => addToCart(product, quantity)}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
