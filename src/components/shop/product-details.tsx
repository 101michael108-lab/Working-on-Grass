
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, BookOpen, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Features for the DPM product for demonstration
const dpmFeatures = [
    "Accurately measures grass biomass per hectare (kg DM/ha).",
    "Calibrated for various grass types and conditions.",
    "Durable, corrosion-resistant construction for field use.",
    "Simple to operate, providing instant readings.",
    "Essential for data-driven grazing management and planning."
];

export default function ProductDetailsClient({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const isDPM = product.name.toLowerCase().includes('disc pasture meter');

  return (
    <div className="container py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Image Column */}
        <div className="bg-secondary/50 rounded-lg flex items-center justify-center p-8">
          <Image
            src={product.image || `https://picsum.photos/seed/${product.id}/500/500`}
            alt={product.name}
            width={500}
            height={500}
            className="object-contain"
            data-ai-hint={product.imageHint}
          />
        </div>

        {/* Details Column */}
        <div>
          <Badge variant="outline" className="mb-2">{product.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
          
          <div className="mt-4 flex items-baseline gap-4">
            <p className="text-3xl font-bold text-accent">
              R{product.price.toFixed(2)}
            </p>
            {product.sku && <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>}
          </div>

          <div className="mt-6 prose text-muted-foreground max-w-none">
            <p>{product.description}</p>
          </div>
          
          {/* Add to Cart Section */}
          <Card className="mt-8 bg-background/50">
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
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
                    <ShoppingCart className="mr-2 h-5 w-5" /> 
                    {product.category === 'Courses' ? 'Enroll Now' : 'Add to Cart'}
                </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Info Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="details" className="w-full">
            <TabsList>
                <TabsTrigger value="details">Product Details</TabsTrigger>
                {isDPM && <TabsTrigger value="features">Features & Benefits</TabsTrigger>}
                {product.category === "Books & Guides" && <TabsTrigger value="author">About the Author</TabsTrigger>}
            </TabsList>
            <TabsContent value="details" className="mt-4 prose max-w-none text-muted-foreground border p-6 rounded-md">
                <h3 className="text-foreground">Full Description</h3>
                <p>{product.description}</p>
                 <table className="mt-4">
                    <tbody>
                        <tr>
                            <td className="font-semibold text-foreground pr-4 py-1">Category</td>
                            <td className='py-1'>{product.category}</td>
                        </tr>
                        {product.brand && (
                             <tr>
                                <td className="font-semibold text-foreground pr-4 py-1">Brand</td>
                                <td className='py-1'>{product.brand}</td>
                            </tr>
                        )}
                        {product.sku && (
                             <tr>
                                <td className="font-semibold text-foreground pr-4 py-1">SKU</td>
                                <td className='py-1'>{product.sku}</td>
                            </tr>
                        )}
                    </tbody>
                 </table>
            </TabsContent>
            {isDPM && (
                 <TabsContent value="features" className="mt-4 border p-6 rounded-md">
                    <h3 className="text-xl font-bold text-foreground mb-4">Key Features</h3>
                    <ul className="space-y-3">
                        {dpmFeatures.map((feature, index) => (
                             <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                 </TabsContent>
            )}
            {product.category === "Books & Guides" && (
                 <TabsContent value="author" className="mt-4 prose max-w-none text-muted-foreground border p-6 rounded-md">
                    <h3 className="text-foreground">About the Author: Frits van Oudtshoorn</h3>
                    <p>Frits van Oudtshoorn is a renowned grassland ecologist and land-use specialist with decades of field experience across Southern Africa. His publications are considered essential resources for farmers, conservationists, and students, blending deep scientific knowledge with practical, on-the-ground application.</p>
                 </TabsContent>
            )}
        </Tabs>
      </div>

    </div>
  );
}
