import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Globe,
  MapPin,
  Search,
  Wifi,
  Camera,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "GrassPro App — Grass Identification for Southern Africa",
  description:
    "Identify grasses of Southern Africa with GrassPro — 1,400+ diagnostic images, GPS filtering, offline mode, and sightings logging. Free download on iOS and Android. Developed by Frits van Oudtshoorn.",
  alternates: { canonical: "/grassPro" },
};

const PLAY_STORE =
  "https://play.google.com/store/apps/details?id=za.co.highbranching.grasspro";
const APP_STORE = "https://apps.apple.com/za/app/grasspro/id1586118050";
const WHATSAPP =
  "https://wa.me/27782280008?text=Hi%20Frits%2C%20I%20have%20a%20question%20about%20the%20GrassPro%20app.";

const features = [
  {
    icon: Camera,
    title: "1,400+ diagnostic images",
    description:
      "High-resolution images covering 320 grass species found across Southern Africa — roots, stems, leaves, seed heads.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Filter by multiple attributes simultaneously — growth form, leaf texture, habitat, and more — to narrow down an identification quickly.",
  },
  {
    icon: MapPin,
    title: "GPS-based location filtering",
    description:
      "The app uses your GPS position to filter species likely to occur in your area, reducing the identification pool immediately.",
  },
  {
    icon: Globe,
    title: "Interactive distribution maps",
    description:
      "View the recorded distribution of each species across Southern Africa to confirm whether it's expected in your region.",
  },
  {
    icon: Wifi,
    title: "Fully offline capable",
    description:
      "All species data and images are stored on your device. No signal needed — works anywhere in the field.",
  },
  {
    icon: CheckCircle2,
    title: "Sightings log",
    description:
      "Record and save your grass sightings with GPS coordinates. Build a personal record of species on your property.",
  },
];

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "GrassPro",
  operatingSystem: "iOS, Android",
  applicationCategory: "UtilitiesApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "ZAR",
    description: "Free download with optional full upgrade at ~R199.99",
  },
  author: {
    "@type": "Person",
    name: "Frits van Oudtshoorn",
  },
  description:
    "Identify grasses of Southern Africa — 1,400+ diagnostic images, GPS filtering, Smart Search, offline mode.",
  downloadUrl: [PLAY_STORE, APP_STORE],
};

export default function GrassProPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      {/* Hero */}
      <section className="w-full bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="bg-accent text-white uppercase tracking-widest px-3 mb-4">
                Free Download
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
                GrassPro
              </h1>
              <p className="mt-2 text-primary-foreground/70 text-lg font-semibold">
                by Frits van Oudtshoorn
              </p>
              <p className="mt-5 text-xl text-primary-foreground/90 font-body max-w-xl mx-auto lg:mx-0">
                Identify grasses of Southern Africa in the field — 320 species,
                1,400+ images, GPS filtering, Smart Search, and full offline
                capability.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-bold"
                >
                  <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer">
                    <svg
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3.18 23.76c.3.17.64.24.99.2l12.7-11.7-2.76-2.77L3.18 23.76zm16.6-10.57-3.07-1.76-3.07 1.76 3.07 2.83 3.07-2.83zM3.17.24C2.87.57 2.7 1.07 2.7 1.7v20.6c0 .63.17 1.13.47 1.46l.08.07 11.54-11.54v-.27L3.25.17l-.08.07zM20.57 9.8l-3.26-1.88-3.26 1.88 3.26 3.02 3.26-3.02z" />
                    </svg>
                    Google Play
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                >
                  <a href={APP_STORE} target="_blank" rel="noopener noreferrer">
                    <svg
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    App Store
                  </a>
                </Button>
              </div>
              <p className="mt-4 text-sm text-primary-foreground/60">
                Free to download · 50 grasses included · Full upgrade ~R199.99
                once-off
              </p>
            </div>
            {/* Placeholder for app screenshot — swap for real screenshot once available */}
            <div className="flex justify-center">
              <div className="relative w-[220px] h-[440px] bg-primary-foreground/10 rounded-3xl border-4 border-primary-foreground/20 flex items-center justify-center shadow-2xl">
                <p className="text-primary-foreground/40 text-sm text-center px-4">
                  App screenshot
                  <br />
                  (upload via admin media)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">
              What GrassPro Does
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Southern African grasses — not a generic
              plant app adapted for the region.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f) => (
              <Card
                key={f.title}
                className="border-2 hover:border-primary/40 transition-colors"
              >
                <CardContent className="pt-6 pb-6 flex flex-col gap-3">
                  <div className="bg-primary/10 p-2 rounded-md w-fit">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold font-headline text-lg">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Companion Book Cross-sell */}
      <section className="w-full py-16 md:py-20 bg-secondary/40 border-y-2">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="bg-primary text-white uppercase tracking-widest px-3 mb-3">
                Companion Reference
              </Badge>
              <h2 className="text-3xl font-bold font-headline">
                Use it with the book
              </h2>
              <p className="mt-4 text-muted-foreground font-body text-lg leading-relaxed">
                GrassPro pairs directly with{" "}
                <strong className="text-foreground">
                  Guide to Grasses of Southern Africa
                </strong>{" "}
                (3rd edition) — the same 320 species, in your hands and on your
                phone. The book gives you the full identification keys and
                ecological detail; the app gives you the images and GPS tools in
                the field.
              </p>
              <p className="mt-3 text-muted-foreground font-body">
                Many users keep both — the book on the bakkie seat, the app on
                their phone.
              </p>
              <Button asChild size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/shop">Get the Book</Link>
              </Button>
            </div>
            <div className="bg-background rounded-lg p-8 border-2 border-primary/10 shadow-sm text-center">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-headline font-bold text-xl">
                Guide to Grasses of Southern Africa
              </h3>
              <p className="text-muted-foreground text-sm mt-2">Third Revised Edition</p>
              <ul className="mt-4 text-sm text-muted-foreground space-y-1 text-left">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /> 320 grass species</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /> 1,000+ full-colour photographs</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /> Identification keys and ecological notes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /> The only full-colour guide for the region</li>
              </ul>
              <Button asChild variant="outline" className="mt-5 border-2 w-full">
                <Link href="/shop">View in Shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="w-full py-16 md:py-20 bg-background">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold font-headline mb-8">
            Who uses GrassPro?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              "Livestock farmers",
              "Game ranch managers",
              "Nature reserve staff",
              "Agricultural consultants",
              "Environmental practitioners",
              "Mine rehabilitation teams",
              "Veld ecologists",
              "Naturalists & students",
            ].map((role) => (
              <div
                key={role}
                className="bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm font-medium border shadow-sm"
              >
                {role}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-16 md:py-20 bg-secondary/30 border-t-2">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold font-headline">
            Questions about GrassPro?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Having trouble identifying a species, or want to know if the app is
            right for your work? Ask Frits directly.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#25D366] text-white hover:bg-[#1ebe5d]"
            >
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp Frits
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2">
              <Link href="/contact">Send a Message</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
