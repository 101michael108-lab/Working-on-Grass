
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import RelatedProducts from '../RelatedProducts';

export default function InDepthLayout({ product, relatedProducts, isLoadingRelated }: { product: Product, relatedProducts: Product[], isLoadingRelated: boolean }) {

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
                
                 <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Button size="lg" asChild><Link href={`/contact?service=Pricing Inquiry: ${product.name}`}>Request Pricing</Link></Button>
                    {product.howItWorks && product.howItWorks.steps && product.howItWorks.steps.length > 0 && <Button size="lg" variant="outline" asChild><Link href="#how-it-works">Learn How It Works</Link></Button>}
                </div>
            </div>
        </div>
      </section>

      {/* 2. Problem / Benefit Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold">Why the {product.name} Matters</h2>
            <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>
        </div>
      </section>

      {/* 3. How It Works Section */}
      {product.howItWorks && product.howItWorks.steps && product.howItWorks.steps.length > 0 && (
        <section id="how-it-works" className="py-16 md:py-24 bg-secondary/30">
            <div className="container">
                <div className="max-w-4xl mx-auto text-center mb-12">
                     <h2 className="text-3xl font-bold">{product.howItWorks.headline || "How It Works"}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {product.howItWorks.steps.map((step, index) => (
                     <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                           <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">{index + 1}</div>
                           {index < product.howItWorks!.steps!.length - 1 && <div className="w-px h-full bg-border mt-2"></div>}
                        </div>
                        <div>
                           <h3 className="font-semibold text-lg">{step.title}</h3>
                           <p className="mt-1 text-muted-foreground">{step.description}</p>
                        </div>
                     </div>
                   ))}
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
                Contact us for pricing and expert advice on how to use this tool effectively.
            </p>
            <div className="mt-8">
               <Button size="lg" asChild><Link href={`/contact?service=Pricing Inquiry: ${product.name}`}>Request Pricing & Consultation</Link></Button>
            </div>
          </div>
      </section>

      {/* 7. Related Resources / Products */}
      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />

    </div>
  );
}
