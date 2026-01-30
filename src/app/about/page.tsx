
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useMedia } from '@/context/media-context';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function AboutPage() {
  const { getImage } = useMedia();
  const aboutImage = getImage('about-frits');

  const clientTypes = [
    "Commercial & Subsistence Farmers",
    "Game Farms & Nature Reserves",
    "Environmental Consultants & EIAs",
    "Mining & Rehabilitation Projects",
    "Conservation Organisations",
    "Government & Academic Institutions"
  ];

  return (
    <div className="bg-background">
      {/* Intro Section */}
      <div className="container py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About Working on Grass</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Science-based grassland and veld management, grounded in decades of practical experience.
        </p>
      </div>

      {/* Main Content Section */}
      <div className="bg-secondary/30 py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="flex justify-center">
              {aboutImage && (
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  width={400}
                  height={400}
                  className="rounded-lg object-cover shadow-lg aspect-square"
                  data-ai-hint={aboutImage.imageHint}
                />
              )}
            </div>
            <div className="text-base text-muted-foreground space-y-4">
              <h2 className="text-3xl font-bold text-foreground mb-4">Meet the Founder</h2>
              <p>
                <strong>Frits van Oudtshoorn</strong> is a grassland ecologist and land-use specialist who founded Working on Grass to bridge the gap between scientific knowledge and practical land management. He believes that healthy grasslands are the foundation of sustainable agriculture and conservation, requiring informed, long-term decision-making.
              </p>
              <p>
                With a Master’s degree in Nature Conservation and extensive experience across Southern Africa, Frits is a recognised specialist in grass identification and veld ecology. His approach is built on a few core principles: providing science-based assessments, offering practical recommendations, and focusing on long-term ecological and economic viability.
              </p>
              <p>
                He is also the author of the acclaimed <strong className="text-foreground">"Guide to Grasses of Southern Africa,"</strong> an essential resource for farmers, students, and conservationists, which is available in the <Link href="/shop" className="text-primary underline">shop</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Who We Work With Section */}
      <section className="py-16 md:py-24">
          <div className="container">
              <h3 className="text-3xl font-bold mb-8 text-center">Who We Work With</h3>
              <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
                  {clientTypes.map((client, index) => (
                      <div key={index} className="bg-secondary text-secondary-foreground text-base font-medium px-4 py-2 rounded-full shadow-sm border">{client}</div>
                  ))}
              </div>
          </div>
      </section>

      {/* Final CTA */}
       <div className="bg-secondary/30 py-16 md:py-24">
        <div className="container text-center">
            <h2 className="text-3xl font-bold">Looking for expert guidance on your grassland or veld?</h2>
             <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
                Let's discuss how we can help you achieve your land management goals.
            </p>
            <div className="mt-8 flex justify-center gap-4">
               <Button asChild size="lg">
                  <Link href="/services">View Our Services</Link>
               </Button>
                 <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Contact Working on Grass</Link>
               </Button>
            </div>
          </div>
       </div>
    </div>
  );
}
