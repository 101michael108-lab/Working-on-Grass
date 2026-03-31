
"use client";

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
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useMedia } from "@/context/media-context";
import { Skeleton } from "@/components/ui/skeleton";

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
      "High-resolution images covering 320 grass species found across Southern Africa: roots, stems, leaves, seed heads.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Filter by multiple attributes simultaneously: growth form, leaf texture, habitat, and more, to narrow down an identification quickly.",
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
      "All species data and images are stored on your device. No signal needed, works anywhere in the field.",
  },
  {
    icon: CheckCircle2,
    title: "Sightings log",
    description:
      "Record and save your grass sightings with GPS coordinates. Build a personal record of species on your property.",
  },
];

export function GrassProClient() {
  const { getImage, isLoading } = useMedia();
  const appPromoImage = getImage('grass-app-promo');

  return (
    <>
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
                Identify grasses of Southern Africa in the field. 320 species,
                1,400+ images, GPS filtering, Smart Search, and full offline
                capability.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
                >
                  <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer">
                    <svg
                      className="mr-2 h-5 w-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
                    </svg>
                    Google Play
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
                >
                  <a href={APP_STORE} target="_blank" rel="noopener noreferrer">
                    <svg
                      className="mr-2 h-5 w-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
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

            {/* Dynamic app screenshot */}
            <div className="flex justify-center">
              {appPromoImage ? (
                <div className="relative group">
                  <div className="absolute -inset-4 bg-primary-foreground/5 rounded-2xl blur-2xl group-hover:bg-primary-foreground/10 transition-colors" />
                  <Image
                    src={appPromoImage.imageUrl}
                    alt={appPromoImage.description || "GrassPro Mobile App Screenshot"}
                    width={320}
                    height={640}
                    className="relative rounded-2xl object-cover shadow-2xl border-8 border-primary-foreground/10"
                    priority
                  />
                </div>
              ) : (
                <div className="relative w-[280px] h-[560px] bg-primary-foreground/5 rounded-3xl border-4 border-primary-foreground/10 flex items-center justify-center shadow-2xl">
                  {isLoading ? (
                    <Skeleton className="w-full h-full rounded-2xl bg-primary-foreground/20" />
                  ) : (
                    <p className="text-primary-foreground/40 text-sm text-center px-4">
                      App screenshot
                      <br />
                      (No promo image found)
                    </p>
                  )}
                </div>
              )}
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
              Built specifically for Southern African grasses, not a generic
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
      <section className="w-full py-16 md:py-20 bg-secondary/40 border-y-2 text-foreground">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="bg-primary text-white uppercase tracking-widest px-3 mb-3 border-none">
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
                (3rd edition), covering the same 320 species in your hands and on your
                phone. The book gives you the full identification keys and
                ecological detail; the app gives you the images and GPS tools in
                the field.
              </p>
              <p className="mt-3 text-muted-foreground font-body">
                Many users keep both: the book on the bakkie seat, the app on
                their phone.
              </p>
              <Button asChild size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 border-b-4 border-black/20">
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
              className="bg-[#25D366] text-white hover:bg-[#1ebe5d] border-b-4 border-black/20"
            >
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="mr-2 h-5 w-5" /> WhatsApp Frits
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
