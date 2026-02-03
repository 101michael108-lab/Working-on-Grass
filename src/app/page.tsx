
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
  CheckCircle2,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { services } from "@/lib/static-data";
import { useMedia } from "@/context/media-context";

// Imports for the shop section
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit, orderBy } from "firebase/firestore";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/shop/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function Home() {
  const { getImage } = useMedia();
  const heroImage = getImage('hero');
  const aboutImage = getImage('about-frits');
  const appPromoImage = getImage('grass-app-promo');

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
  
  // Specifically fetch the Disc Pasture Meter or a fallback from Measurement & Tools
  const featuredProductQuery = useMemoFirebase(() => 
    query(collection(firestore, 'products'), where('category', '==', 'Measurement & Tools'), limit(1)),
    [firestore]
  );
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useCollection<Omit<Product, 'id'>>(featuredProductQuery);
  const featuredProduct = featuredProducts?.[0];

  // Fetch more products for the scrollable sidebar
  const otherProductsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('name'), limit(8));
  }, [firestore]);
  const { data: allOtherProducts, isLoading: isLoadingOthers } = useCollection<Omit<Product, 'id'>>(otherProductsQuery);
  
  const otherProducts = allOtherProducts?.filter(p => p.id !== featuredProduct?.id);

  const isLoading = isLoadingFeatured || isLoadingOthers;


  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Hero Section */}
      <section className="relative w-full">
        <div className="absolute inset-0">
          {heroImage ? (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description || "Vast green fields of South African veld under a clear blue sky"}
              fill
              priority
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
            />
          ) : (
             <div className="w-full h-full bg-secondary animate-pulse" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl py-32 sm:py-48 lg:py-56 text-center sm:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white font-headline">
                Sustainable Veld Management, Guided by Experience
                </h1>
                <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/90 font-body mx-auto sm:mx-0">
                Practical, science-based guidance for managing and restoring your land. Led by grassland ecologist Frits van Oudtshoorn.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
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
              <Card key={service.title} className="hover:shadow-lg transition-shadow flex flex-col border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-2xl"><Leaf className="text-primary"/>{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="link" className="p-0 font-bold text-accent">
                       <Link href="/services">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products Section - Premium Technical Bulletin Style */}
        <section className="w-full py-16 md:py-24 bg-background border-y-2">
            <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter font-headline">From the Shop</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Essential tools and resources developed from decades of in-the-field experience.
                </p>
            </div>
            
            <div className="mx-auto max-w-6xl">
                {isLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Skeleton className="lg:col-span-2 h-[500px] rounded-lg" />
                        <div className="space-y-8">
                            <Skeleton className="h-[240px] rounded-lg" />
                            <Skeleton className="h-[240px] rounded-lg" />
                        </div>
                    </div>
                ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">
                        {/* Featured Flagship Layout - Technical Bulletin Style */}
                        {featuredProduct && (
                            <div className="lg:col-span-2 flex flex-col">
                                <div className="relative border-4 border-primary/20 bg-card rounded-md overflow-hidden shadow-xl flex flex-col h-full">
                                    {/* Bulletin Header */}
                                    <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 opacity-80" />
                                            <span className="text-xs font-bold uppercase tracking-[0.3em]">Technical Bulletin No. 01</span>
                                        </div>
                                        <Badge className="bg-accent text-white font-bold px-3 border-none">FLAGSHIP TOOL</Badge>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-5 bg-white/40 flex-grow">
                                        <div className="md:col-span-2 p-6 flex items-center justify-center bg-white/60 border-r-2 border-primary/5">
                                            <Link href={`/shop/${featuredProduct.id}`} className="block relative aspect-square w-full">
                                                <Image 
                                                    src={featuredProduct.images?.[0] || `https://picsum.photos/seed/${featuredProduct.id}/600/600`} 
                                                    alt={featuredProduct.name}
                                                    fill
                                                    className="object-contain hover:scale-105 transition-transform duration-500"
                                                />
                                            </Link>
                                        </div>
                                        <div className="md:col-span-3 p-8 flex flex-col">
                                            <div className="space-y-2 mb-6">
                                                <h3 className="text-4xl font-headline font-bold leading-tight text-foreground">
                                                    {featuredProduct.name}
                                                </h3>
                                                <p className="text-sm font-bold text-accent uppercase tracking-widest italic">
                                                    {featuredProduct.valueProposition || "Professional Field Measurement"}
                                                </p>
                                            </div>

                                            <div className="space-y-4 font-body">
                                                <div className="bg-secondary/20 p-4 rounded border-l-4 border-primary">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {featuredProduct.description.substring(0, 180)}...
                                                    </p>
                                                </div>
                                                
                                                {/* Technical Spec Snippet */}
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold uppercase text-primary/60">Field Utility</p>
                                                        <p className="text-xs font-medium">Biomass Estimation</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold uppercase text-primary/60">Build Grade</p>
                                                        <p className="text-xs font-medium">Field-Tested Rugged</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-8 border-t-2 border-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="text-left">
                                                    <p className="text-3xl font-headline font-bold text-accent leading-none">R{featuredProduct.price.toFixed(2)}</p>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Excl. Delivery & VAT</p>
                                                </div>
                                                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 shadow-md">
                                                    <Link href={`/shop/${featuredProduct.id}`}>View Technical Brief <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Sidebar Grid for other curated products - Now Scrollable */}
                        <div className="lg:col-span-1 flex flex-col h-full">
                            <div className="bg-secondary/20 p-4 border-l-4 border-accent mb-4 shrink-0">
                                <h4 className="font-headline font-bold text-xl leading-tight">Recommended by Frits</h4>
                                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.2em] font-bold">Essential Field Materials</p>
                            </div>
                            
                            <ScrollArea className="flex-grow pr-4 h-[500px] lg:h-auto">
                                <div className="space-y-6">
                                    {otherProducts?.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    
                    {/* Centered Footer Action */}
                    <div className="mt-12 flex justify-center">
                        <Button asChild variant="outline" className="w-full max-w-md h-12 border-2 font-bold uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-colors">
                            <Link href="/shop">Browse Full Catalog</Link>
                        </Button>
                    </div>
                </>
                )}
            </div>
            </div>
        </section>

      {/* About Frits */}
      <section id="about" className="w-full py-16 md:py-24 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex justify-center lg:order-last">
              {aboutImage ? (
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  width={450}
                  height={450}
                  className="rounded-lg object-cover aspect-square shadow-lg border-4 border-white"
                  data-ai-hint={aboutImage.imageHint}
                />
              ) : (
                <Skeleton className="w-[450px] h-[450px] rounded-lg" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter font-headline">
                Meet the Founder
              </h2>
              <div className="mt-4 prose max-w-none text-muted-foreground mx-auto sm:mx-0">
                <blockquote className="border-l-4 border-primary pl-4 italic font-body text-xl">
                  "My goal is to bridge the gap between science and the farmer. Sustainable land management isn't just about conservation; it's about building resilient, profitable agricultural businesses for generations to come."
                </blockquote>
                <p className="mt-4 font-bold text-foreground">
                  - Frits van Oudtshoorn, Grassland Ecologist
                </p>
              </div>
              <p className="mt-4 max-w-[600px] text-muted-foreground md:text-lg/relaxed mx-auto sm:mx-0 font-body">
                With decades of field experience, Frits is a leading authority on veld management, ecological assessments, and rehabilitation across Southern Africa. His practical, science-based approach has helped countless land-owners improve their productivity and ecological health.
              </p>
               <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 border-b-4 border-black/20">
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
                      <Badge className="bg-accent text-white uppercase tracking-widest px-3 mb-2">Coming Soon</Badge>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter font-headline">GrassPro</h2>
                      <p className="mt-4 max-w-[600px] text-muted-foreground md:text-xl/relaxed mx-auto sm:mx-0 font-body">
                          Your veld management partner, in your pocket. Identify grasses, calculate biomass, and make informed decisions on the go.
                      </p>
                      <ul className="mt-6 space-y-4 text-muted-foreground text-left max-w-md mx-auto sm:mx-0">
                          <li className="flex items-start gap-3">
                              <div className="bg-primary/10 p-2 rounded-md"><Camera className="h-5 w-5 text-primary flex-shrink-0" /></div>
                              <span className="font-body"><strong>Instant Grass ID:</strong> Snap a photo to identify hundreds of grass species with detailed ecological information.</span>
                          </li>
                          <li className="flex items-start gap-3">
                              <div className="bg-primary/10 p-2 rounded-md"><Calculator className="h-5 w-5 text-primary flex-shrink-0" /></div>
                              <span className="font-body"><strong>Biomass Calculation:</strong> Use your phone's camera with our digital disc pasture meter to estimate grazing capacity.</span>
                          </li>
                          <li className="flex items-start gap-3">
                              <div className="bg-primary/10 p-2 rounded-md"><BookOpen className="h-5 w-5 text-primary flex-shrink-0" /></div>
                              <span className="font-body"><strong>Veld Management Log:</strong> Keep track of grazing patterns, rainfall, and veld condition over time.</span>
                          </li>
                      </ul>
                      <Button className="mt-8 border-2" disabled variant="outline">
                          Notify Me When Available
                      </Button>
                  </div>
                   <div className="flex justify-center">
                        {appPromoImage ? (
                          <div className="relative group">
                            <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-2xl group-hover:bg-primary/10 transition-colors" />
                            <Image
                                src={appPromoImage.imageUrl}
                                alt={appPromoImage.description}
                                width={350}
                                height={700}
                                className="relative rounded-xl object-cover shadow-2xl border-8 border-background"
                                data-ai-hint={appPromoImage.imageHint}
                            />
                          </div>
                        ) : (
                          <Skeleton className="w-[350px] h-[700px] rounded-xl" />
                        )}
                  </div>
              </div>
          </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-16 md:py-20 bg-secondary/30 border-t-2">
          <div className="container text-center">
            <h2 className="text-3xl font-bold font-headline">Need expert guidance on your land or veld?</h2>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
               <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto border-b-4 border-black/20">
                  <Link href="/contact?service=Quote+Request">Request a Consultation</Link>
               </Button>
                 <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary/20 hover:border-primary">
                  <Link href="/contact">Contact Us</Link>
               </Button>
            </div>
          </div>
      </section>

    </div>
  );
}
