
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Globe,
  MapPin,
  Search,
  Wifi,
  Camera,
  FileDown,
  BookOpen,
  Smartphone,
  Users,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMedia } from "@/context/media-context";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const PLAY_STORE =
  "https://play.google.com/store/apps/details?id=za.co.highbranching.grasspro";
const APP_STORE = "https://apps.apple.com/za/app/grasspro/id1586118050";
const WHATSAPP =
  "https://wa.me/27782280008?text=Hi%20Frits%2C%20I%20have%20a%20question%20about%20the%20GrassPro%20app.";

const features = [
  {
    icon: Camera,
    title: "2 000+ diagnostic images",
    description:
      "High-resolution images covering 390 grass species found across Southern Africa: roots, stems, leaves, seed heads.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Filter by multiple attributes simultaneously: growth form, leaf texture, habitat, and more, to narrow down an identification quickly.",
  },
  {
    icon: MapPin,
    title: "GPS functionality",
    description:
      "Indicates grass species in your immediate vicinity, reducing the identification pool based on your location.",
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

const accordionItems = [
  {
    value: "smart-search",
    trigger: "1. Smart Search",
    content:
      'Grass identification is made easy with the Smart Search function. You can identify a grass using various features (plant height, inflorescence type, spikelet type, leaf width, etc.). Going through this process will bring up a list of grass "candidates", arranged from most to least likely the grass you want to identify. The Smart Search function also allows you to create grass lists and combined lists on features such as uses (pasture grasses, ornamental grasses, thatching grasses, lawn grasses, etc.), ecological info (grazing value, plant succession, ecological index, weeds and invaders), geographical status (endemic, indigenous and non-indigenous), world distribution, and taxonomic ranking (subfamily and tribe).',
  },
  {
    value: "grass-list",
    trigger: "2. Grass List",
    content:
      "The grass list button takes you to a list of all grasses on the app (or a list of grasses in your area if you have set your location). The names on the list can be alphabetically arranged according to the scientific name or common name of your choice. The list shows the inflorescence photo of each grass and a range of icons below the name. These icons provide information at a glance and include grazing value, ecological status, plant succession, life cycle, growth form, geographical status, grass uses and weediness.",
  },
  {
    value: "species-info",
    trigger: "3. Species Information",
    content:
      "Touching the inflorescence in the grass list brings up the full species information. Each species has 3–10 excellent photos illustrating the whole plant, the inflorescence, spikelets and other diagnostic features. Species information includes a full description, a distribution range map, and the option to record the grass on your personalised sightings list.",
  },
  {
    value: "descriptions",
    trigger: "4. Grass Descriptions",
    content:
      "Each species has a detailed description covering: main features for identification, how to distinguish it from similar-looking species, the habitat in which it grows, uses and grazing value, world distribution, measurements, and common names in various languages. A summary of ecological info, geographical info, habitat and soils, identification features and taxonomic classification is included at the bottom of each description.",
  },
  {
    value: "distribution",
    trigger: "5. Distribution Maps",
    content:
      "Each species has a distribution map indicating its range across southern Africa (south of the Zambezi and Kunene rivers). Countries covered: Botswana, Eswatini, Lesotho, Namibia, Mozambique, South Africa and Zimbabwe.",
  },
  {
    value: "gps-location",
    trigger: "6. GPS & Location",
    content:
      "The location function allows you to set your current GPS position, select a location from the map, or use the whole of Southern Africa. When a location is selected, the app only considers grasses occurring in that area for identification — dramatically narrowing the species pool and improving identification accuracy.",
  },
  {
    value: "settings",
    trigger: "7. Language Settings",
    content:
      "The settings function allows you to choose a language for listing grasses. Two names are shown with each grass: the primary name and the secondary name. The primary name can be set to the scientific name, English name or Afrikaans name. The secondary name can be set to a choice of 28 southern African languages.",
  },
  {
    value: "sightings",
    trigger: "8. Sightings Log",
    content:
      "The sightings log allows you to add species to one or more personal sightings lists. These lists show all the grasses you have previously recorded, building a permanent record of species identified on a property or in a specific area.",
  },
  {
    value: "offline",
    trigger: "9. Fully Offline",
    content:
      "All species data, images and content are stored on your device after installation. No internet connection is needed in the field. The app works anywhere across Southern Africa.",
  },
];

const roles = [
  "Livestock farmers",
  "Game ranch managers",
  "Nature reserve staff",
  "Agricultural consultants",
  "Environmental practitioners",
  "Mine rehabilitation teams",
  "Veld ecologists",
  "Naturalists & students",
];

export function GrassProClient() {
  const { getImage, isLoading } = useMedia();
  const appPromoImage = getImage("grass-app-promo");

  return (
    <>
      {/* ── Section 1: Hero ── */}
      <section className="w-full bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
                GrassPro
              </h1>
              <p className="mt-2 text-primary-foreground/70 text-lg font-semibold">
                by Frits van Oudtshoorn &amp; SmartSearch Apps
              </p>
              <p className="mt-5 text-xl text-primary-foreground/90 font-body max-w-xl mx-auto lg:mx-0">
                Identify grasses of Southern Africa in the field. 390 species,
                2 000+ images, GPS functionality, Smart Search, and full offline
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
                Free to download · 50 grasses included · Full upgrade ~R199.99 per year
              </p>
            </div>

            {/* App promo image */}
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

      {/* ── Section 2: About GrassPro ── */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left column */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">
                About GrassPro
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                GrassPro Southern Africa is a smart mobile tool that helps you identify
                grasses and provides a wealth of ecological and agricultural information
                on each species. It contains a comprehensive content-rich database with
                written and taxonomic information, distribution maps, illustrative
                photographs, and other useful content.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                What sets this app apart is that it filters and ranks your grass species
                list during a search, using the innovative, intuitive and interactive
                award-winning &ldquo;Smart Search&rdquo; function. It further includes GPS
                functionality to indicate the grass species occurring in your immediate
                vicinity.
              </p>
              <div className="bg-primary/10 border-l-4 border-primary rounded-r-lg p-4 mb-4">
                <p className="text-sm leading-relaxed">
                  GrassPro is a collaborative initiative by grass expert Frits van
                  Oudtshoorn and well-known app developer SmartSearch Apps. It was
                  officially launched on 26 July 2023 during the 58th annual congress
                  of the Grassland Society of Southern Africa (GSSA).
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Endorsed by the Grassland Society of Southern Africa · Supported by Briza Publications
              </p>
            </div>

            {/* Right column: feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f) => (
                <Card
                  key={f.title}
                  className="border hover:border-primary/40 hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="pt-5 pb-5 flex flex-col gap-2">
                    <div className="bg-primary/10 p-2 rounded-md w-fit">
                      <f.icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-bold font-headline text-sm">{f.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: App Functions in Detail ── */}
      <section className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">
              App Functions in Detail
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Below is an overview of each main function available in GrassPro.
            </p>
          </div>
          <Accordion type="single" collapsible defaultValue="smart-search" className="w-full">
            {accordionItems.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger className="text-left font-semibold">
                  {item.trigger}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Section 4: Getting the App + PDF Guide ── */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: How to get the app */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">
                How to Get the App
              </h2>
              <ol className="space-y-5">
                {[
                  'Search for "GrassPro" on the Google Play Store or Apple App Store and download the free evaluation version.',
                  "The free version includes 50 sample grass species — enough to explore the app before upgrading.",
                  'To unlock all 390 species, tap "Purchase Options" below the GrassPro title on the home screen and follow the instructions.',
                  "The full version costs R 199.99/year, which includes free access to all future expansions and upgrades.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {i + 1}
                    </span>
                    <p className="text-muted-foreground leading-relaxed text-sm">{step}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild className="bg-white text-primary border border-primary/20 hover:bg-primary/5 font-bold shadow-sm">
                  <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer">
                    <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
                    </svg>
                    Google Play
                  </a>
                </Button>
                <Button asChild className="bg-white text-primary border border-primary/20 hover:bg-primary/5 font-bold shadow-sm">
                  <a href={APP_STORE} target="_blank" rel="noopener noreferrer">
                    <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                    </svg>
                    App Store
                  </a>
                </Button>
              </div>
            </div>

            {/* Right: PDF Guide download */}
            <div>
              <div className="border-2 border-primary/20 bg-primary/5 p-8 text-center rounded-lg">
                <FileDown className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold font-headline mb-2">
                  GrassPro User Guide
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  A comprehensive PDF guide covering all app features, functions, and
                  how to get the most out of GrassPro in the field.
                </p>
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/resources">
                    Download PDF Guide
                    <svg
                      className="ml-2 h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Available free from our Resources page
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Who Uses GrassPro? ── */}
      <section className="w-full py-16 md:py-20 bg-background">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold font-headline mb-8">
            Who uses GrassPro?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {roles.map((role) => (
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

      {/* ── Section 6: Final CTA ── */}
      <section className="w-full py-16 md:py-20 bg-secondary/30 border-t-2">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold font-headline">
            Questions about GrassPro?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Having trouble identifying a species, or want to know if the app is right
            for your work? Ask Frits directly.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-whatsapp hover:bg-whatsapp-hover text-white border-b-4 border-black/20"
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
