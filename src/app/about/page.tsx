
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useMedia } from '@/context/media-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

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

      {/* ── Intro ────────────────────────────────────────────────────── */}
      <div className="container py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About Frits van Oudtshoorn</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Working on Grass is built around the consulting, publishing, and field work of grassland ecologist Frits van Oudtshoorn: practical, science-based land management for Southern Africa.
        </p>
        <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground">
          Frits also runs <strong className="text-foreground">Africa Land-Use Training (ALUT)</strong>, an accredited training provider. Formal courses are offered through ALUT separately. Visit{" "}
          <a href="https://alut.co.za" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors">alut.co.za</a>.
        </p>
      </div>

      {/* ── Meet Frits ───────────────────────────────────────────────── */}
      <div className="bg-surface py-16 md:py-24">
        <div className="container">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="shrink-0">
              {aboutImage ? (
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  width={180}
                  height={180}
                  className="rounded-lg object-cover aspect-square shadow-lg border-4 border-background"
                  data-ai-hint={aboutImage.imageHint}
                />
              ) : (
                <Skeleton className="h-[180px] w-[180px] rounded-lg" />
              )}
            </div>
            <div className="space-y-4 text-muted-foreground text-base">
              <h2 className="text-3xl font-bold text-foreground">Frits van Oudtshoorn</h2>
              <blockquote className="border-l-4 border-primary pl-4 italic font-body text-xl text-muted-foreground">
                "My goal is to bridge the gap between science and the farmer — sustainable land management builds resilient, profitable agricultural businesses for generations to come."
              </blockquote>
              <p>
                Frits grew up on a farm in Limpopo Province, South Africa, and has spent more than 30 years working as a rangeland and pasture consultant, training provider, and author. He holds a <strong className="text-foreground">Master's degree in Nature Conservation, specialising in Ecological Restoration</strong>, and grounds his work in both practical experience and sound scientific principles.
              </p>
              <p>
                He is widely regarded as one of Southern Africa's leading practical experts on grasslands and veld management. His consulting spans commercial livestock farms, game ranches, nature reserves, and land rehabilitation projects. His approach is straightforward: science-based advice, communicated in plain language and tailored to the specific conditions of each farm or property.
              </p>
              <p>
                Frits is the author of two authoritative publications:{" "}
                <Link href="/shop" className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors font-medium">Guide to Grasses of Southern Africa</Link>{" "}
                (3rd edition, the only full-colour grass identification guide for the region) and{" "}
                <Link href="/shop" className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors font-medium">Veld Management: Principles and Practices</Link>.
                He also developed the <Link href="/grassPro" className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors font-medium">GrassPro Southern Africa app</Link>, a mobile tool that assists with grass identification and provides extensive ecological and agricultural information on each species.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Who We Work With ─────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-bold mb-3 text-center">Who Frits Works With</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
            From commercial farms to conservation sanctuaries and mines. If the work involves grass, natural rangelands or pastures and forages, Frits has likely done it.
          </p>
          <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-3">
            {clientTypes.map((client, index) => (
              <div key={index} className="bg-surface text-secondary-foreground text-sm font-medium px-4 py-2 rounded-full border border-border shadow-sm">
                {client}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <div className="bg-surface py-16 md:py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold">Need expert guidance on your land or veld?</h2>
          <p className="mt-2 max-w-xl mx-auto text-muted-foreground">
            WhatsApp Frits directly — he responds personally.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-whatsapp hover:bg-whatsapp-hover text-white w-full sm:w-auto border-b-4 border-black/20">
              <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20discuss%20a%20project." target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="mr-2 h-5 w-5 shrink-0" /> WhatsApp Frits
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary/30 hover:border-primary">
              <Link href="/consulting">View Consulting Services</Link>
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
