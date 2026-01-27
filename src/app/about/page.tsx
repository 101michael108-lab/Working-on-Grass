import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find((p) => p.id === 'about-frits');
  const approachImage = PlaceHolderImages.find((p) => p.id === 'grass-research');
  const galleryImages = PlaceHolderImages.filter(p => p.id.startsWith('gallery-')).slice(0, 3);

  const principles = [
    "Science-based assessments providing objective, data-driven insights.",
    "Practical, implementable recommendations tailored to your specific environment.",
    "A focus on long-term ecological sustainability and economic viability.",
    "Site-specific solutions that respect the unique characteristics of your land.",
    "Commitment to measurable monitoring and continuous improvement."
  ];

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
          Science-based grassland and veld management, grounded in decades of practical experience across Southern Africa.
        </p>
      </div>

      {/* Section 1: Who is Frits van Oudtshoorn */}
      <div className="bg-secondary/30 py-12 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
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
            <div>
              <h2 className="text-3xl font-bold mb-4">Meet the Founder</h2>
              <div className="prose max-w-none text-muted-foreground space-y-4 text-base">
                <p>
                  <strong>Frits van Oudtshoorn</strong> is a grassland ecologist and land-use specialist with extensive experience in veld condition assessment, grazing management, and ecological restoration. Holding a Master’s degree in Nature Conservation, Frits has dedicated his career to bridging the gap between scientific principles and on-the-ground application.
                </p>
                <p>
                  He has worked with a diverse range of clients, including commercial farmers, conservation bodies, mining houses, and environmental consultants across Southern Africa, providing practical, site-specific solutions for sustainable land management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
       {/* Section 2: Professional Credentials & Experience */}
      <div className="container py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
           <div>
              <h3 className="text-2xl font-bold mb-6">Professional Credentials</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <span><strong>Master’s Degree</strong> in Nature Conservation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <span>Recognised specialist in <strong>grass identification and veld ecology</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <span>Founder of Working on Grass, providing expert advisory since 2003.</span>
                </li>
                 <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <span>Extensive experience in <strong>ecological surveys, EIAs, and mine rehabilitation projects</strong>.</span>
                </li>
              </ul>
            </div>
             <div>
              <h3 className="text-2xl font-bold mb-6">Publications & Books</h3>
              <p className="text-muted-foreground mb-4">Frits is the author of several authoritative guides, including the acclaimed <strong className="text-foreground">"Guide to Grasses of Southern Africa,"</strong> an essential resource for farmers, students, and conservationists.</p>
              <Button asChild>
                <Link href="/shop">Browse Publications</Link>
              </Button>
            </div>
        </div>
      </div>

       {/* Section 3: Why Working on Grass Exists */}
      <div className="bg-secondary/30 py-12 md:py-20">
        <div className="container">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <div>
                <h2 className="text-3xl font-bold mb-4">Our Philosophy</h2>
                <div className="prose max-w-none text-muted-foreground space-y-4">
                  <p>
                    Working on Grass was established to bridge the gap between scientific knowledge and practical land management. Healthy grasslands are the foundation of sustainable agriculture, conservation, and rehabilitation — and they require informed, long-term decision-making.
                  </p>
                  <p>
                    Our mission is to empower land managers with the tools and understanding to read their veld, make data-driven grazing decisions, and restore ecological balance. We believe that economic viability and environmental health are not mutually exclusive, but deeply interconnected.
                  </p>
                </div>
            </div>
             <div className="flex justify-center">
                {approachImage && (
                  <Image
                    src={approachImage.imageUrl}
                    alt={approachImage.description}
                    width={500}
                    height={350}
                    className="rounded-lg object-cover shadow-lg w-full aspect-[4/3]"
                    data-ai-hint={approachImage.imageHint}
                  />
                )}
            </div>
           </div>
        </div>
      </div>

       {/* Section 4 & 5: Principles & Clients */}
       <div className="container py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12">
           <div>
              <h3 className="text-2xl font-bold mb-6">Our Approach & Principles</h3>
              <ul className="space-y-3 text-muted-foreground">
                {principles.map((principle, index) => (
                   <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                    <span>{principle}</span>
                   </li>
                ))}
              </ul>
            </div>
             <div>
              <h3 className="text-2xl font-bold mb-6">Who We Work With</h3>
              <div className="flex flex-wrap gap-2">
                 {clientTypes.map((client, index) => (
                    <div key={index} className="bg-secondary text-secondary-foreground text-sm font-medium px-3 py-1 rounded-full">{client}</div>
                 ))}
              </div>
            </div>
        </div>
      </div>

      {/* Optional: Gallery */}
      <div className="container pb-12 md:pb-20">
        <h3 className="text-2xl font-bold mb-6 text-center">A Glimpse of Our Work</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-lg">
               <Image
                  src={image.imageUrl}
                  alt={image.description}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover aspect-[3/2] hover:scale-105 transition-transform"
                  data-ai-hint={image.imageHint}
                />
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
       <div className="bg-secondary/30 py-12 md:py-20">
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
