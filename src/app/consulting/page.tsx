
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { services, consultationServices } from "@/lib/static-data";
import { useMedia } from "@/context/media-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConsultationForm } from "@/components/consultation-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ArrowRight, Wrench, MessageCircle, Quote } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

const WA_BASE = "https://wa.me/27782280008";
const waLink = (msg: string) => `${WA_BASE}?text=${encodeURIComponent(msg)}`;

export default function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  const { getImage } = useMedia();
  const heroImage = getImage('about-frits');

  const handleRequestConsultation = (serviceTitle?: string) => {
    setSelectedService(serviceTitle);
    setIsModalOpen(true);
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Environmental and Agricultural Consultation',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Working on Grass',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Modimolle',
        addressRegion: 'Limpopo',
        addressCountry: 'ZA'
      }
    },
    areaServed: 'Southern Africa',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Land Management Services',
      itemListElement: services.map(s => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.title,
          description: s.description
        }
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <div className="container pt-8 md:pb-20">
        <Breadcrumbs items={[{ label: "Consulting" }]} />
        
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-2">Frits van Oudtshoorn · MSc Nature Conservation</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">Veld Management Consulting</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground font-body">
              30 years of hands-on grassland and veld expertise — available to your farm, game ranch, or reserve. Practical advice, not textbook theory.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="bg-[#25D366] text-white hover:bg-[#1ebe5d]"
                asChild
              >
                <a href={waLink("Hi Frits, I'd like to discuss a consultation.")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp Frits
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-2" onClick={() => handleRequestConsultation()}>
                Send a Message
              </Button>
              <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                View all services ↓
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            {heroImage ? (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={400}
                height={400}
                className="rounded-lg object-cover shadow-lg aspect-square border-4 border-white"
                data-ai-hint={heroImage.imageHint}
              />
            ) : (
              <Skeleton className="h-[400px] w-[400px] rounded-lg" />
            )}
          </div>
        </div>

        {/* Services Grid */}
        <div id="services" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.title} className="flex flex-col border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{service.whoIsItFor}</p>
                <CardTitle className="font-headline text-2xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="font-body text-base leading-relaxed">{service.description}</CardDescription>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5d]" asChild>
                  <a href={waLink(`Hi Frits, I'd like to enquire about: ${service.title}`)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Frits
                  </a>
                </Button>
                <Button className="w-full" variant="outline" onClick={() => handleRequestConsultation(service.title)}>
                  {service.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Contextual Product Link - Related Tools */}
        <div className="mt-16 bg-secondary/30 p-8 rounded-lg border-2 border-dashed border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <Wrench className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Essential Tools for Veld Assessment</h3>
                    <p className="text-muted-foreground text-sm">We recommend using the Disc Pasture Meter for accurate biomass estimation.</p>
                </div>
            </div>
            <Button asChild variant="outline" className="shrink-0 border-2">
                <Link href="/shop">Explore Measurement Tools <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
        </div>

        {/* Social Proof */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-10 font-headline">What Clients Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Frits's assessment gave us a clear picture of our veld condition and a practical plan to improve it. His knowledge of Southern African grasses is unmatched.",
                name: "Commercial Livestock Farmer",
                region: "Limpopo",
              },
              {
                quote: "We engaged Frits for an ecological management plan for our game ranch. His report was thorough, practical, and immediately usable — not a desk study.",
                name: "Game Ranch Manager",
                region: "Waterberg",
              },
              {
                quote: "The EIA vegetation assessment Frits completed for our project was accepted without issues. His credibility with regulators is well established.",
                name: "Environmental Practitioner",
                region: "Gauteng",
              },
            ].map((t, i) => (
              <Card key={i} className="border-2 bg-secondary/20 relative">
                <CardContent className="pt-8 pb-6">
                  <Quote className="h-6 w-6 text-primary/20 absolute top-4 left-4" />
                  <p className="text-muted-foreground font-body italic leading-relaxed text-sm">
                    "{t.quote}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-primary/10">
                    <p className="font-bold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.region}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            * Testimonials are representative. Names withheld by request.
          </p>
        </div>

        {/* Detailed Service List */}
        <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-8 font-headline">What a Consultation Can Cover</h2>
            <Card className="max-w-5xl mx-auto shadow-md">
                <CardContent className="p-8">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-muted-foreground font-body">
                        {consultationServices.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <Check className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>


         {/* Final CTA */}
        <div className="mt-20 text-center bg-primary text-primary-foreground py-16 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold font-headline">Not sure which service applies to your land?</h2>
             <p className="mt-2 max-w-2xl mx-auto opacity-90 text-lg">
                Every farm, veld, and project is different. Send Frits a quick message — he'll point you in the right direction.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
               <Button size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5d] px-10 font-bold shadow-md" asChild>
                <a href={waLink("Hi Frits, I'm not sure which consulting service I need. Can you help?")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp Frits
                </a>
               </Button>
               <Button size="lg" variant="secondary" className="px-10 font-bold shadow-md" onClick={() => handleRequestConsultation()}>
                Send a Message
               </Button>
            </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">Request Expert Guidance</DialogTitle>
            <DialogDescription className="font-body text-base">
              Submit your details and ecologist Frits van Oudtshoorn will contact you directly to discuss your situation.
            </DialogDescription>
          </DialogHeader>
          <ConsultationForm
            service={selectedService}
            onSuccess={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
