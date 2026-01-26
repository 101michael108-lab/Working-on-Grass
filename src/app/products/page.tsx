import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { products, seedCategories } from "@/lib/data";
import { CheckCircle, ShoppingCart } from "lucide-react";

export default function ProductsPage() {
  const dpm = products.find(p => p.category === 'Instruments');
  const seeds = products.find(p => p.category === 'Seeds');

  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Our Products</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          High-quality tools and seeds to support your sustainable land management practices.
        </p>
      </div>

      {dpm && (
        <section id="dpm" className="mb-20">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 md:p-12">
                <CardTitle className="text-3xl mb-2">{dpm.name}</CardTitle>
                <CardDescription className="text-base text-muted-foreground mb-4">
                  The essential tool for accurately determining grass biomass per hectare (kg dry grass/ha).
                </CardDescription>
                
                <div className="space-y-3 text-sm text-foreground/80 mb-6">
                  <p><strong>How it works:</strong> The DPM consists of a disc attached to a sliding tube on a measured rod. Drop it onto the grass, and record the height where the disc settles. The average of these readings is used in a calibration equation to find biomass.</p>
                  <p><strong>Common Uses:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Determining the grazing capacity on a property.</li>
                    <li>Making decisions regarding prescribed burning.</li>
                  </ul>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                   <span className="text-3xl font-bold text-accent">R{dpm.price.toFixed(2)}</span>
                   <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                     <Link href={`/shop/${dpm.id}`}><ShoppingCart className="mr-2 h-5 w-5" /> Buy Now</Link>
                   </Button>
                </div>
              </div>
              <div className="bg-secondary/50 h-full flex items-center justify-center p-8">
                <Image
                  src={dpm.image}
                  alt={dpm.name}
                  width={450}
                  height={450}
                  className="object-contain rounded-lg"
                  data-ai-hint={dpm.imageHint}
                />
              </div>
            </div>
          </Card>
        </section>
      )}

      {seeds && (
        <section id="seeds">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Pasture & Cover Crop Seed</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              As a registered seed agent for Barenbrug SA, we offer a full range of high-quality seeds for various climatic conditions and uses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {seedCategories.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.types.map((type, index) => (
                       <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>{type}</span>
                       </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

           <div className="text-center mt-12">
                <p className="text-muted-foreground mb-4">Feel free to contact us for more information or a personalized quotation.</p>
                <Button asChild>
                    <Link href="/contact">Request a Quote</Link>
                </Button>
           </div>
        </section>
      )}
    </div>
  );
}
