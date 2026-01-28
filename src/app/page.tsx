
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Quote,
  BookOpen,
  Globe,
  Award
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { services } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  ]

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-primary-foreground p-4">
          <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white font-headline">
              Sustainable Veld Management, Guided by Experience
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-200 font-body">
              Practical, science-based guidance for managing and restoring your land. Led by grassland ecologist Frits van Oudtshoorn.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/contact?service=Professional+Assessment">Request a Consultation</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/services">View Services</Link>
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
      <section id="services" className="w-full py-12 md:py-24 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What We Do</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              We provide expert advisory, assessment, and planning services to help you achieve sustainable and productive land use.
            </p>
          </div>
          <div className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
            {services.slice(0, 6).map((service) => (
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
      
      {/* Featured Products / Knowledge */}
       <section className="w-full py-12 md:py-24">
         <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Products & Knowledge</h2>
                <p className="text-muted-foreground mb-8">
                  Beyond consultation, we offer essential tools, publications, and training developed from decades of in-the-field experience.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Products</CardTitle>
                      <CardDescription>Tools, books, and seeds to support your land management goals.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                       <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                          <Link href="/shop">Visit Shop</Link>
                       </Button>
                    </CardFooter>
                  </Card>
                   <Card>
                    <CardHeader>
                      <CardTitle>Courses & Training</CardTitle>
                      <CardDescription>Learn from an expert with our in-depth online and in-person courses.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                       <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                          <Link href="/courses">View Training</Link>
                       </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
               <div className="flex justify-center">
                <Image
                  src={PlaceHolderImages.find(p => p.id === 'book-guide')?.imageUrl || ''}
                  alt="A collection of books and tools for grassland management"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover aspect-square shadow-lg"
                  data-ai-hint="books tools"
                />
              </div>
            </div>
         </div>
       </section>

      {/* About Frits */}
      <section id="about" className="w-full py-12 md:py-24 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Meet the Founder
              </h2>
              <p className="mt-4 max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                Frits van Oudtshoorn is a grassland ecologist and land-use specialist with decades of experience in veld management, ecological assessments, and rehabilitation across Southern Africa.
              </p>
               <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/about">Read More About Frits <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
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

       {/* Social Proof */}
       <section id="testimonials" className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
           <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Clients Say</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Real results from farmers, ranchers, and conservationists across Africa.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            <Card>
              <CardContent className="pt-6">
                <Quote className="w-8 h-8 text-primary mb-4" />
                <p className="text-muted-foreground mb-4">"Frits's grazing plan helped us see our veld in a new way. The grass is healthier, and our livestock have benefited greatly."</p>
                <div className="flex items-center gap-4">
                   <Avatar>
                      <AvatarImage src="https://picsum.photos/seed/client1/40/40" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">John D.</p>
                      <p className="text-sm text-muted-foreground">Cattle Farmer, North West</p>
                    </div>
                </div>
              </CardContent>
            </Card>
             <Card>
              <CardContent className="pt-6">
                <Quote className="w-8 h-8 text-primary mb-4" />
                <p className="text-muted-foreground mb-4">"The ecological assessment we received was incredibly thorough. It formed the foundation of our new conservation strategy. Truly expert work."</p>
                <div className="flex items-center gap-4">
                   <Avatar>
                      <AvatarImage src="https://picsum.photos/seed/client2/40/40" />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Sarah M.</p>
                      <p className="text-sm text-muted-foreground">Conservation Manager, Kenya</p>
                    </div>
                </div>
              </CardContent>
            </Card>
             <Card>
              <CardContent className="pt-6">
                <Quote className="w-8 h-8 text-primary mb-4" />
                <p className="text-muted-foreground mb-4">"We were managing our veld based on intuition. The condition assessment gave us the data to make confident, long-term decisions."</p>
                <div className="flex items-center gap-4">
                   <Avatar>
                      <AvatarImage src="https://picsum.photos/seed/client3/40/40" />
                      <AvatarFallback>BV</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Bennie van der Merwe</p>
                      <p className="text-sm text-muted-foreground">Game Rancher, Limpopo</p>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-12 md:py-20 bg-secondary/30">
          <div className="container text-center">
            <h2 className="text-3xl font-bold">Need expert guidance on your land or veld?</h2>
            <div className="mt-6 flex justify-center gap-4">
               <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/contact?service=Quote+Request">Request a Consultation</Link>
               </Button>
                 <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Contact Us</Link>
               </Button>
            </div>
          </div>
      </section>

    </div>
  );
}
