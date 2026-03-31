
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
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export default function Home() {
  const { getImage } = useMedia();
  const { t } = useLanguage();
  const heroImage = getImage('hero');
  const aboutImage = getImage('about-frits');
  const appPromoImage = getImage('grass-app-promo');

  const trustPillars = [
    { icon: Award,    text: "30+ years of hands-on field experience" },
    { icon: BookOpen, text: "Author · Guide to Grasses of Southern Africa" },
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/15" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl py-20 sm:py-32 lg:py-40 text-center sm:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white font-headline drop-shadow-md">
              {t("hero.headline")}
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl text-white/85 font-body mx-auto sm:mx-0 drop-shadow">
              {t("hero.subheadline")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
              <Button asChild size="lg" className="bg-whatsapp hover:bg-whatsapp-hover text-white w-full sm:w-auto shadow-lg border-b-4 border-black/20">
                <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20request%20a%20consultation." target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="mr-2 h-5 w-5 shrink-0" /> WhatsApp Frits
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-white/60 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white/80 backdrop-blur-sm">
                <Link href="/shop">Explore the Shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ──────────────────────────────────────────────── */}
      <section className="bg-background border-b">
        <div className="container px-4 md:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {trustPillars.map((pillar, index) => (
              <div key={index} className="flex flex-col items-center justify-center gap-3">
                <div className="bg-primary/10 rounded-full p-3">
                  <pillar.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug">{pillar.text}</p>
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

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 sm:gap-6">
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
            <Button asChild variant="outline" className="border-2 border-primary/60 hover:border-primary hover:bg-primary hover:text-primary-foreground font-bold transition-colors">
              <Link href="/shop">Browse the Full Shop <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── About Frits ──────────────────────────────────────────────── */}
      <section id="about" className="w-full py-16 md:py-24 bg-surface">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter font-headline">
                Meet Frits van Oudtshoorn
              </h2>
              <div className="mt-4">
                <blockquote className="border-l-4 border-primary pl-4 italic font-body text-xl text-muted-foreground">
                  "My goal is to bridge the gap between science and the farmer — sustainable land management builds resilient, profitable agricultural businesses for generations to come."
                </blockquote>
              </div>
              <p className="mt-5 max-w-[600px] text-muted-foreground md:text-lg/relaxed font-body">
                Frits holds a master's degree in Nature Conservation (Ecological Restoration) and has spent 30 years conducting veld assessments, rehabilitation projects, and grazing capacity studies across Southern Africa. He is the author of <em>Guide to Grasses of Southern Africa</em> and <em>Veld Management &ndash; Principles and Practices</em>, and a registered Barenbrug seed agent.
              </p>
              <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/about">Read More About Frits <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="flex justify-center">
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
                Identify grasses of Southern Africa in the field. Over 1,400 diagnostic images, GPS-based filtering, offline capable. Download the evaluation version for free with a full upgrade available.
              </p>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-muted-foreground text-left max-w-md sm:max-w-none mx-auto sm:mx-0">
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md shrink-0"><Camera className="h-5 w-5 text-primary" /></div>
                  <span className="font-body text-sm md:text-base"><strong>1,400+ diagnostic images</strong> covering 390 grass species of Southern Africa.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md shrink-0"><Globe className="h-5 w-5 text-primary" /></div>
                  <span className="font-body text-sm md:text-base"><strong>GPS-based filtering</strong> and interactive distribution maps per species.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md shrink-0"><CheckCircle2 className="h-5 w-5 text-primary" /></div>
                  <span className="font-body text-sm md:text-base"><strong>Works fully offline</strong>, no signal needed. Sightings logging included.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md shrink-0"><BookOpen className="h-5 w-5 text-primary" /></div>
                  <span className="font-body text-sm md:text-base"><strong>Pairs with the book</strong>, built as a companion to <em>Guide to Grasses of Southern Africa</em>.</span>
                </li>
              </ul>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href="https://play.google.com/store/apps/details?id=za.co.highbranching.grasspro" target="_blank" rel="noopener noreferrer">
                    <svg className="mr-2 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z"/></svg>
                    Google Play
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-primary/30 hover:border-primary">
                  <a href="https://apps.apple.com/za/app/grasspro/id1586118050" target="_blank" rel="noopener noreferrer">
                    <svg className="mr-2 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>
                    App Store
                  </a>
                </Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground text-center sm:text-left">
                Free to download · 50 grasses included · Full upgrade ~R199.99 once-off.
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
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter font-headline">How can we help you?</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Expert field consulting or the right tools for the job. Find what you need below.
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
                    Frits works directly with farmers, game reserves, and land managers. Veld assessments, grazing capacity studies, rehabilitation plans, and grazing management, all tailored to your specific land.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-whatsapp hover:bg-whatsapp-hover text-white">
                    <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20request%20a%20consultation." target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon className="mr-2 h-4 w-4" /> WhatsApp Frits
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
                    The <em>Guide to Grasses</em>, Disc Pasture Meters, seed mixes, and the GrassPro app. Every resource Frits uses and recommends, available to order directly.
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
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Get in touch and our team will make sure you reach the right person.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-whatsapp hover:bg-whatsapp-hover text-white w-full sm:w-auto border-b-4 border-black/20">
              <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%20need%20expert%20guidance%20on%20my%20land." target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="mr-2 h-5 w-5 shrink-0" /> WhatsApp Frits
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
