
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { services, consultationServices } from "@/lib/static-data";
import { useMedia } from "@/context/media-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConsultationForm } from "@/components/consultation-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Check } from "lucide-react";

export default function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  const { getImage } = useMedia();
  const heroImage = getImage('about-frits');

  const handleRequestConsultation = (serviceTitle?: string) => {
    setSelectedService(serviceTitle);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="container pt-12 md:pb-20">
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Grassland & Veld Management Services</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Practical, science-based assessments and advice by grassland specialist Frits van Oudtshoorn.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <Button size="lg" onClick={() => handleRequestConsultation()}>Request a Consultation</Button>
              <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Or view services below
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
                className="rounded-lg object-cover shadow-lg aspect-square"
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
            <Card key={service.title} className="flex flex-col">
              <CardHeader>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{service.whoIsItFor}</p>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-accent text-accent-foreground" onClick={() => handleRequestConsultation(service.title)}>
                  {service.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Detailed Service List */}
        <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-8">Our Consultation Services Include</h2>
            <Card className="max-w-5xl mx-auto">
                <CardContent className="p-8">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-muted-foreground">
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
        <div className="mt-20 text-center bg-secondary/30 py-16 rounded-lg">
            <h2 className="text-3xl font-bold">Not sure which service applies to your land?</h2>
             <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
                Every farm, veld, and project is different. A short consultation helps determine the most appropriate assessment or management approach.
            </p>
            <div className="mt-8">
               <Button size="lg" onClick={() => handleRequestConsultation()}>Request a Consultation</Button>
            </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Request Expert Guidance</DialogTitle>
            <DialogDescription>
              Submit your details and Frits van Oudtshoorn will contact you directly to discuss your situation.
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
