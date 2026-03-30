
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
  CheckCircle2,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMedia } from "@/context/media-context";
import { useLanguage } from "@/context/language-context";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/shop/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const WA_ICON = (
  <svg className="mr-2 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Home() {
  const { getImage } = useMedia();
  const { t } = useLanguage();
  const heroImage = getImage('hero');
  const aboutImage = getImage('about-frits');
  const appPromoImage = getImage('grass-app-promo');

  const trustPillars = [
    { icon: Award,    text: "30+ years of hands-on field experience" },
    { icon: BookOpen, text: "Author — Guide to Grasses of Southern Africa (3rd ed.)" },
    { icon: Leaf,     text: "MSc Nature Conservation · Ecological Restoration" },
    { icon: Globe,    text: "Registered Barenbrug SA Seed Agent" },
  ];

  const firestore = useFirestore();

  const shopPreviewQuery = useMemoFirebase(
    () => query(collection(firestore, 'products'), orderBy('name'), limit(3)),
    [firestore]
  );
  const { data: shopPreviewProducts, isLoading } = useCollection<Omit<Product, 'id'>>(shopPreviewQuery);

  return (
    <div className="flex flex-col min-h-[100dvh]">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
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
              {t("hero.headline")}
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/90 font-body mx-auto sm:mx-0">
              {t("hero.subheadline")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
              <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5d] w-full sm:w-auto">
                <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20request%20a%20consultation." target="_blank" rel="noopener noreferrer">
                  {WA_ICON} WhatsApp Frits
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/shop">Explore the Shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ──────────────────────────────────────────────── */}
      <section className="bg-background border-b">
        <div className="container px-4 md:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {trustPillars.map((pillar, index) => (
              <div key={index} className="flex flex-col items-center justify-center gap-2">
                <pillar.icon className="w-7 h-7 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── From the Shop ────────────────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-3 text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter font-headline">From the Shop</h2>
            <p className="max-w-2xl text-muted-foreground md:text-lg">
              Books, field instruments, and resources built from 30 years on the land.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[380px] rounded-lg" />
                ))
              : shopPreviewProducts?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
            }
          </div>

          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="border-2 border-primary/30 hover:border-primary hover:bg-primary hover:text-primary-foreground font-bold transition-colors">
              <Link href="/shop">Browse the Full Shop <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── About Frits ──────────────────────────────────────────────── */}
      <section id="about" className="w-full py-16 md:py-24 bg-surface">
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
                Meet Frits van Oudtshoorn
              </h2>
              <div className="mt-4">
                <blockquote className="border-l-4 border-primary pl-4 italic font-body text-xl text-muted-foreground">
                  "My goal is to bridge the gap between science and the farmer — sustainable land management builds resilient, profitable agricultural businesses for generations to come."
                </blockquote>
              </div>
              <p className="mt-5 max-w-[600px] text-muted-foreground md:text-lg/relaxed mx-auto sm:mx-0 font-body">
                Frits holds an MSc in Nature Conservation (Ecological Restoration) and has spent 30 years conducting veld assessments, rehabilitation projects, and grazing capacity studies across Southern Africa. He is the author of <em>Guide to Grasses of Southern Africa</em> (now in its 3rd edition) and a registered Barenbrug seed agent.
              </p>
              <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 border-b-4 border-black/20">
                <Link href="/about">Read More About Frits <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── GrassPro App ─────────────────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="text-center sm:text-left">
              <Badge className="bg-primary text-white uppercase tracking-widest px-3 mb-2">Free Download</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter font-headline">GrassPro App</h2>
              <p className="mt-4 max-w-[600px] text-muted-foreground md:text-xl/relaxed mx-auto sm:mx-0 font-body">
                Identify grasses of Southern Africa in the field — 1,400+ diagnostic images, GPS-based filtering, offline capable. Free to download with a full upgrade available.
              </p>
              <ul className="mt-6 space-y-4 text-muted-foreground text-left max-w-md mx-auto sm:mx-0">
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md"><Camera className="h-5 w-5 text-primary flex-shrink-0" /></div>
                  <span className="font-body"><strong>1,400+ diagnostic images</strong> covering 320 grass species of Southern Africa.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md"><Globe className="h-5 w-5 text-primary flex-shrink-0" /></div>
                  <span className="font-body"><strong>GPS-based location filtering</strong> and interactive distribution maps per species.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md"><BookOpen className="h-5 w-5 text-primary flex-shrink-0" /></div>
                  <span className="font-body"><strong>Companion to the book</strong> — pairs directly with <em>Guide to Grasses of Southern Africa</em>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md"><CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" /></div>
                  <span className="font-body"><strong>Works offline</strong> — no signal needed in the field. Sightings logging included.</span>
                </li>
              </ul>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href="https://play.google.com/store/apps/details?id=za.co.highbranching.grasspro" target="_blank" rel="noopener noreferrer">
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.18 23.76c.3.17.64.24.99.2l12.7-11.7-2.76-2.77L3.18 23.76zm16.6-10.57-3.07-1.76-3.07 1.76 3.07 2.83 3.07-2.83zM3.17.24C2.87.57 2.7 1.07 2.7 1.7v20.6c0 .63.17 1.13.47 1.46l.08.07 11.54-11.54v-.27L3.25.17l-.08.07zM20.57 9.8l-3.26-1.88-3.26 1.88 3.26 3.02 3.26-3.02z"/></svg>
                    Google Play
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-primary/30 hover:border-primary">
                  <a href="https://apps.apple.com/za/app/grasspro/id1586118050" target="_blank" rel="noopener noreferrer">
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    App Store
                  </a>
                </Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground text-center sm:text-left">
                Free — 50 grasses included. Full upgrade: ~R199.99 once-off.
              </p>
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

      {/* ── How can Frits help you? (2-path) ────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-surface border-t">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter font-headline">How can Frits help you?</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Boots-on-the-ground expertise or the right tools for the job — find what you need below.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* Path 1 — Consulting */}
            <Card className="border-2 border-primary/20 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 flex flex-col h-full gap-5">
                <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center shrink-0">
                  <Leaf className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-headline">Need a consultation?</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    Frits works directly with farmers, game ranchers, and land managers. Veld assessments, grazing capacity studies, rehabilitation plans, and mine re-vegetation — all tailored to your specific land.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-[#25D366] text-white hover:bg-[#1ebe5d]">
                    <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20request%20a%20consultation." target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Frits
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="border-primary/30 hover:border-primary">
                    <Link href="/consulting">View Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Path 2 — Shop */}
            <Card className="border-2 border-accent/20 hover:border-accent/50 transition-colors">
              <CardContent className="p-8 flex flex-col h-full gap-5">
                <div className="bg-accent/10 rounded-full w-14 h-14 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-7 w-7 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-headline">Looking for books or tools?</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    The <em>Guide to Grasses</em>, Disc Pasture Meters, seed mixes, and the GrassPro app — every resource Frits uses and recommends, available to order directly.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/shop">Browse the Shop <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" className="border-accent/30 hover:border-accent">
                    <Link href="/seeds">Seed Enquiries</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="w-full py-16 md:py-20 bg-background border-t-2">
        <div className="container text-center">
          <h2 className="text-3xl font-bold font-headline">Need expert guidance on your land or veld?</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Send Frits a quick WhatsApp — he'll respond personally.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5d] w-full sm:w-auto border-b-4 border-black/20">
              <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%20need%20expert%20guidance%20on%20my%20land." target="_blank" rel="noopener noreferrer">
                {WA_ICON} WhatsApp Frits
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary/20 hover:border-primary">
              <Link href="/contact">Send a Message</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
