
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  BookOpen,
  Globe,
  Award,
  Camera,
  Calculator,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { services } from "@/lib/static-data";
import { PlaceHolderImages } from "@/lib/placeholder-images";

// Imports for the new shop section
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/shop/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";


export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  const trustPillars = [
      {
          icon: Award,
          text: "Decades of on-the-ground experience"
      },
      {
          icon: BookOpen,
          text: "Author of 'Guide to Grasses of Southern Africa'"
      },
      {
          icon: Leaf,
          text: "Specialist in veld ecology & rehabilitation"
      },
      {
          icon: Globe,
          text: "Based in Limpopo, serving Southern Africa"
      }
  ];

  const firestore = useFirestore();
  const featuredProductQuery = useMemoFirebase(() => 
    query(collection(firestore, 'products'), where('name', '==', 'Disc Pasture Meter'), limit(1)),
    [firestore]
  );
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useCollection<Omit<Product, 'id'>>(featuredProductQuery);
  const featuredProduct = featuredProducts?.[0];

  const otherProductsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), where('name', '!=', 'Disc Pasture Meter'), limit(2));
  }, [firestore]);
  const { data: otherProducts, isLoading: isLoadingOthers } = useCollection<Omit<Product, 'id'>>(otherProductsQuery);

  const isLoading = isLoadingFeatured || isLoadingOthers;


  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh]">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt="Vast green fields of South African veld under a clear blue sky"
            fill
            priority
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
          />
        )}
        {/* Darker gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        {/* Container for content, aligned to bottom-left */}
        <div className="relative h-full flex flex-col items-center justify-center text-center sm:text-left p-8 md:justify-end md:items-start md:p-16 lg:p-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white font-headline">
              Sustainable Veld Management, Guided by Experience
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/90 font-body">
              Practical, science-based guidance for managing and restoring your land. Led by grassland ecologist Frits van Oudtshoorn.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
                <Link href="/contact?service=Professional+Assessment">Request a Consultation</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/shop">Explore the Shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-background border-b">
          <div className="container px-4 md:px-6 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {trustPillars.map((pillar, index) => (
                      <div key={index} className="flex flex-col items-center justify-center gap-2">
                          <pillar.icon className="w-7 h-7 text-primary"/>
                          <p className="text-sm font-medium text-muted-foreground">{pillar.text}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* What We Do */}
      <section id="services" className="w-full py-16 md:py-24 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">What We Do</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              We provide expert advisory, assessment, and planning services to help you achieve sustainable and productive land use.
            </p>
          </div>
          <div className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
            {services.map((service) => (
              <Card key={service.title} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Leaf className="text-primary"/>{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="link" className="p-0">
                       <Link href="/services">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products Section */}
        <section className="w-full py-16 md:py-24 bg-background">
            <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">From the Shop</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Essential tools, publications, and products developed from decades of in-the-field experience.
                </p>
            </div>
            <div className="mx-auto max-w-6xl pt-12">
                {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-[350px] w-full rounded-lg" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
                         <Skeleton className="h-[420px] w-full rounded-lg" />
                         <Skeleton className="h-[420px] w-full rounded-lg" />
                    </div>
                </div>

                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {featuredProduct && (
                        <div className="lg:col-span-2">
                            <Card className="flex flex-col md:flex-row group h-full overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-colors shadow-lg">
                               <div className="md:w-1/2 p-6 flex items-center justify-center bg-secondary/30">
                                 <Link href={`/shop/${featuredProduct.id}`}>
                                    <Image 
                                        src={featuredProduct.image || `https://picsum.photos/seed/${featuredProduct.id}/400/400`} 
                                        alt={featuredProduct.name}
                                        width={400}
                                        height={400}
                                        className="object-contain group-hover:scale-105 transition-transform"
                                        data-ai-hint={featuredProduct.imageHint}
                                    />
                                  </Link>
                               </div>
                               <div className="flex flex-col md:w-1/2">
                                    <CardHeader className="p-6">
                                        <Badge>Featured Product</Badge>
                                        <CardTitle className="text-2xl mt-2">{featuredProduct.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0 flex-grow">
                                        <p className="text-muted-foreground text-sm line-clamp-4">{featuredProduct.description}</p>
                                    </CardContent>
                                    <CardFooter className="p-6 flex flex-wrap justify-between items-center gap-4">
                                        <p className="text-3xl font-bold text-accent">R{featuredProduct.price.toFixed(2)}</p>
                                        <Button asChild size="lg">
                                            <Link href={`/shop/${featuredProduct.id}`}>View Details <ArrowRight className="ml-2" /></Link>
                                        </Button>
                                    </CardFooter>
                               </div>
                            </Card>
                        </div>
                    )}
                    <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
                        {otherProducts?.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
                )}
            </div>
            <div className="mt-12 text-center">
                <Button asChild size="lg" variant="outline">
                <Link href="/shop">
                    Explore All Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                </Button>
            </div>
            </div>
        </section>

      {/* About Frits */}
      <section id="about" className="w-full py-16 md:py-24 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex justify-center lg:order-last">
              <Image
                src={PlaceHolderImages.find(p => p.id === 'about-frits')?.imageUrl || ''}
                alt="Frits van Oudtshoorn"
                width={450}
                height={450}
                className="rounded-lg object-cover aspect-square shadow-lg"
                data-ai-hint={PlaceHolderImages.find(p => p.id === 'about-frits')?.imageHint}
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">
                Meet the Founder
              </h2>
              <div className="mt-4 prose max-w-none text-muted-foreground mx-auto lg:mx-0">
                <blockquote className="border-l-4 border-primary pl-4 italic">
                  "My goal is to bridge the gap between science and the farmer. Sustainable land management isn't just about conservation; it's about building resilient, profitable agricultural businesses for generations to come."
                </blockquote>
                <p className="mt-4">
                  <strong>- Frits van Oudtshoorn</strong>, Grassland Ecologist
                </p>
              </div>
              <p className="mt-4 max-w-[600px] text-muted-foreground md:text-lg/relaxed mx-auto sm:mx-0">
                With decades of field experience, Frits is a leading authority on veld management, ecological assessments, and rehabilitation across Southern Africa. His practical, science-based approach has helped countless land-owners improve their productivity and ecological health.
              </p>
               <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/about">Read More About Frits <ArrowRight className="ml-2 h-4 w-4" /></Link>
               </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Grass App Section */}
      <section className="w-full py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                  <div className="text-center sm:text-left">
                      <Badge>Coming Soon</Badge>
                      <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">The Grass Guide App</h2>
                      <p className="mt-4 max-w-[600px] text-muted-foreground md:text-xl/relaxed mx-auto sm:mx-0">
                          Your veld management partner, in your pocket. Identify grasses, calculate biomass, and make informed decisions on the go.
                      </p>
                      <ul className="mt-6 space-y-4 text-muted-foreground text-left max-w-md mx-auto sm:mx-0">
                          <li className="flex items-start gap-3">
                              <Camera className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                              <span><strong>Instant Grass ID:</strong> Snap a photo to identify hundreds of grass species with detailed ecological information.</span>
                          </li>
                          <li className="flex items-start gap-3">
                              <Calculator className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                              <span><strong>Biomass Calculation:</strong> Use your phone's camera with our digital disc pasture meter to estimate grazing capacity.</span>
                          </li>
                          <li className="flex items-start gap-3">
                              <BookOpen className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                              <span><strong>Veld Management Log:</strong> Keep track of grazing patterns, rainfall, and veld condition over time.</span>
                          </li>
                      </ul>
                      <Button className="mt-8" disabled>
                          Notify Me When Available
                      </Button>
                  </div>
                   <div className="flex justify-center">
                        <Image
                            src={PlaceHolderImages.find(p => p.id === 'grass-app-promo')?.imageUrl || ''}
                            alt="A smartphone displaying the Grass Guide app in a sunny field"
                            width={350}
                            height={700}
                            className="rounded-xl object-cover shadow-2xl"
                            data-ai-hint={PlaceHolderImages.find(p => p.id === 'grass-app-promo')?.imageHint}
                        />
                  </div>
              </div>
          </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-16 md:py-20 bg-secondary/30">
          <div className="container text-center">
            <h2 className="text-3xl font-bold">Need expert guidance on your land or veld?</h2>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
               <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
                  <Link href="/contact?service=Quote+Request">Request a Consultation</Link>
               </Button>
                 <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="/contact">Contact Us</Link>
               </Button>
            </div>
          </div>
      </section>

    </div>
  );
}
