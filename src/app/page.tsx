"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Sprout,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { services } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Product } from "@/lib/types";

export default function Home() {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => query(collection(firestore, 'products'), orderBy('name'), limit(1)), [firestore]);
  const { data: products } = useCollection<Omit<Product, 'id'>>(productsQuery);
  const dpmProduct = products?.[0];

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');
  const galleryImages = PlaceHolderImages.filter(p => p.id.startsWith('gallery-'));
  
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <section className="relative w-full h-[60vh] md:h-[80vh]">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt="Vast green fields under a clear blue sky"
            fill
            priority
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-primary-foreground p-4">
          <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
              Working on Grass
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200">
              Sustainable & Regenerative Land Use Advisory
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/services">Our Services <ArrowRight className="ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4">About Us</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Pioneering Regenerative Land Use in Africa
              </h2>
              <p className="mt-4 max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Founded by renowned author and environmentalist Frits van Oudtshoorn, Working on Grass is an environmental and agricultural services company with a passion for sustainable land management. We are based in South Africa and serve clients across the continent.
              </p>
            </div>
            <div className="flex justify-center">
              <Image
                src={PlaceHolderImages.find(p => p.id === 'about-frits')?.imageUrl || ''}
                alt="Frits van Oudtshoorn"
                width={400}
                height={400}
                className="rounded-full object-cover aspect-square shadow-lg"
                data-ai-hint={PlaceHolderImages.find(p => p.id === 'about-frits')?.imageHint}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Badge variant="default" className="bg-primary text-primary-foreground">Our Expertise</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Advisory Services</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Led by Frits van Oudtshoorn and a team of specialists, we provide expert consultation on a wide range of topics related to veld and grazing management.
            </p>
          </div>
          <div className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
            {services.slice(0, 6).map((service) => (
              <Card key={service.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Leaf className="text-primary"/>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{service.description.substring(0, 100)}...</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild>
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section id="products" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          {dpmProduct && (
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="flex flex-col items-start">
                <Badge variant="outline" className="mb-4">Featured Product</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{dpmProduct.name}</h2>
                <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                  {dpmProduct.description.split('.')[0]}. An easy alternative to cutting, drying, and weighing grass samples for measuring biomass.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-3xl font-bold text-accent">R{dpmProduct.price.toFixed(2)}</span>
                  <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href={`/shop/${dpmProduct.id}`}>Buy Now</Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <Image
                  src={dpmProduct?.image || 'https://picsum.photos/seed/placeholder/500/500'}
                  alt={dpmProduct.name}
                  width={500}
                  height={500}
                  className="rounded-lg object-contain aspect-square"
                  data-ai-hint={dpmProduct.imageHint || "product image"}
                />
              </div>
            </div>
          )}
        </div>
      </section>

       <section id="gallery" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Gallery</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              A glimpse into our work and the beautiful landscapes we help manage.
            </p>
          </div>
          <div className="py-12">
            <Carousel opts={{ loop: true }} className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {galleryImages.map((image, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="overflow-hidden">
                        <CardContent className="p-0">
                          <Image
                            src={image.imageUrl}
                            alt={image.description}
                            width={400}
                            height={300}
                            className="aspect-[4/3] w-full object-cover transition-transform hover:scale-105"
                            data-ai-hint={image.imageHint}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          <div className="text-center">
            <Button asChild>
              <Link href="/gallery">View Full Gallery</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container">
          <Card className="bg-primary text-primary-foreground">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 md:p-12">
                <Badge variant="secondary" className="mb-4">Get The App</Badge>
                <h3 className="text-3xl font-bold">GrassPro App</h3>
                <p className="mt-2 text-primary-foreground/80">
                  Your digital companion for advanced pasture management. Available soon on all platforms.
                </p>
                <Button variant="secondary" className="mt-6" disabled>
                  More Info Coming Soon...
                </Button>
              </div>
              <div className="hidden md:flex justify-center p-8">
                 <Sprout className="w-32 h-32 text-primary-foreground/50"/>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
