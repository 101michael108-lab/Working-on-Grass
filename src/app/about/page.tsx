
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useMedia } from '@/context/media-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const WA_ICON = (
  <svg className="mr-2 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
          Working on Grass is built around the consulting, publishing, and field work of grassland ecologist Frits van Oudtshoorn — practical, science-based land management for Southern Africa.
        </p>
        <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground">
          Frits also runs <strong className="text-foreground">Africa Land-Use Training (ALUT)</strong>, an accredited training provider. Formal courses are offered through ALUT separately —{" "}
          <a href="https://alut.co.za" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors">visit alut.co.za</a>.
        </p>
      </div>

      {/* ── Meet Frits ───────────────────────────────────────────────── */}
      <div className="bg-surface py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="flex justify-center">
              {aboutImage ? (
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  width={420}
                  height={420}
                  className="rounded-lg object-cover shadow-lg aspect-square border-4 border-background"
                  data-ai-hint={aboutImage.imageHint}
                />
              ) : (
                <Skeleton className="h-[420px] w-[420px] rounded-lg" />
              )}
            </div>
            <div className="space-y-4 text-muted-foreground text-base">
              <h2 className="text-3xl font-bold text-foreground">Frits van Oudtshoorn</h2>
              <blockquote className="border-l-4 border-primary pl-4 italic font-body text-xl text-muted-foreground">
                "My goal is to bridge the gap between science and the farmer — sustainable land management builds resilient, profitable agricultural businesses for generations to come."
              </blockquote>
              <p>
                Frits grew up on a farm in Limpopo and has spent over 30 years in the field as a grassland ecologist, consultant, and author. He holds a <strong className="text-foreground">Master's degree in Nature Conservation, specialising in Ecological Restoration</strong> — and everything he does is grounded in that practical and scientific foundation.
              </p>
              <p>
                He is widely regarded as Southern Africa's foremost practical grass and veld expert. His consulting work spans commercial livestock farms, game ranches, nature reserves, mine rehabilitation projects, and EIA assessments. His approach is direct — science-based advice delivered in plain language, specific to the farm or property at hand.
              </p>
              <p>
                Frits is the author of two authoritative works:{" "}
                <Link href="/shop" className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors font-medium">Guide to Grasses of Southern Africa</Link>{" "}
                (3rd edition — the only full-colour grass ID guide for the region) and{" "}
                <Link href="/shop" className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors font-medium">Veld Management: Principles and Practices</Link>.
                He also developed the <Link href="/grassPro" className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors font-medium">GrassPro app</Link> for field grass identification.
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
            From commercial farms to mine rehabilitation — if the work involves grass, veld, or land, Frits has likely done it.
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
            <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5d] w-full sm:w-auto border-b-4 border-black/20">
              <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20discuss%20a%20project." target="_blank" rel="noopener noreferrer">
                {WA_ICON} WhatsApp Frits
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
