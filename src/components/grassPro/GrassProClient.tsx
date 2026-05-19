
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
  ArrowRight,
  Tractor,
  TreePine,
  Leaf,
  BarChart3,
  HardHat,
  Microscope,
  GraduationCap,
  Binoculars,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { useMedia } from "@/context/media-context";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PLAY_STORE =
  "https://play.google.com/store/apps/details?id=za.co.highbranching.grasspro";
const APP_STORE = "https://apps.apple.com/za/app/grasspro/id1586118050";
const WHATSAPP =
  "https://wa.me/27782280008?text=Hi%20Frits%2C%20I%20have%20a%20question%20about%20the%20GrassPro%20app.";

const PlayStoreSVG = () => (
  <svg className="mr-2 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
  </svg>
);

const AppStoreSVG = () => (
  <svg className="mr-2 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
  </svg>
);

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

const audiences = [
  { icon: Tractor,      label: "Livestock farmers" },
  { icon: Binoculars,   label: "Game ranch managers" },
  { icon: Leaf,         label: "Nature reserve staff" },
  { icon: BarChart3,    label: "Agricultural consultants" },
  { icon: Globe,        label: "Environmental practitioners" },
  { icon: HardHat,      label: "Mine rehabilitation teams" },
  { icon: Microscope,   label: "Veld ecologists" },
  { icon: GraduationCap,label: "Naturalists & students" },
];

export function GrassProClient() {
  const { getImage, isLoading } = useMedia();
  const appPromoImage = getImage("grass-app-promo");

  const PhoneShell = ({ priority = false }: { priority?: boolean }) => (
    <div className="relative mx-auto w-[250px] sm:w-[280px]">
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-primary/20 blur-3xl rounded-full" />
      <div className="relative rounded-[44px] bg-gray-900 border-[6px] border-gray-800 shadow-[0_30px_80px_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-2xl z-10" />
        {appPromoImage ? (
          <Image
            src={appPromoImage.imageUrl}
            alt={appPromoImage.description || "GrassPro app screenshot"}
            width={280}
            height={560}
            className="block"
            priority={priority}
          />
        ) : isLoading ? (
          <Skeleton className="w-[280px] h-[560px] rounded-none" />
        ) : (
          <div className="w-[280px] h-[560px] bg-gray-800 flex items-center justify-center">
            <p className="text-gray-500 text-sm text-center px-6">App screenshot</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────
          SECTION 1 — HERO
      ───────────────────────────────────────────────────────────────── */}
      <section className="w-full bg-primary text-primary-foreground overflow-hidden">
        <div className="container px-4 md:px-6 pt-16 md:pt-24 pb-0">
          <div className="grid lg:grid-cols-2 gap-10 items-end">

            {/* Left — copy */}
            <div className="pb-16 md:pb-24 text-center lg:text-left">
              <p className="text-primary-foreground/50 text-sm font-semibold uppercase tracking-widest mb-3">
                Southern Africa&rsquo;s grass identification app
              </p>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold font-headline tracking-tight leading-none">
                GrassPro
              </h1>
              <p className="mt-2 text-primary-foreground/60 text-base font-medium">
                by Frits van Oudtshoorn &amp; SmartSearch Apps
              </p>
              <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 font-body max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Identify any grass species in the field — with award-winning Smart Search,
                GPS-aware filtering, 2&nbsp;000+ diagnostic images, and full offline capability.
              </p>

              {/* Store buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg h-14 px-6">
                  <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer">
                    <PlayStoreSVG /> Google Play
                  </a>
                </Button>
                <Button asChild size="lg" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-bold h-14 px-6">
                  <a href={APP_STORE} target="_blank" rel="noopener noreferrer">
                    <AppStoreSVG /> App Store
                  </a>
                </Button>
              </div>
              <p className="mt-3 text-xs text-primary-foreground/40">
                Free to download · 50 species included · Full version R199.99/year
              </p>

              {/* Stats strip */}
              <div className="mt-10 pt-8 border-t border-white/15 flex flex-wrap gap-x-8 gap-y-4 justify-center lg:justify-start">
                {[
                  { value: "390",    label: "grass species" },
                  { value: "2 000+", label: "diagnostic images" },
                  { value: "28",     label: "languages" },
                  { value: "Free",   label: "to start" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                    <span className="text-primary-foreground/50 text-sm ml-1.5">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — phone, sits on the bottom edge */}
            <div className="flex justify-center lg:justify-end items-end pb-0">
              <div className="relative mx-auto w-[240px] sm:w-[280px] lg:w-[300px]">
                <div className="absolute -inset-8 bg-white/5 blur-3xl rounded-full" />
                <div className="relative rounded-[44px] bg-gray-900 border-[6px] border-gray-800 shadow-[0_-20px_80px_rgba(0,0,0,0.4),0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-2xl z-10" />
                  {appPromoImage ? (
                    <Image
                      src={appPromoImage.imageUrl}
                      alt="GrassPro app home screen"
                      width={300}
                      height={600}
                      className="block"
                      priority
                    />
                  ) : isLoading ? (
                    <Skeleton className="w-[300px] h-[600px] rounded-none bg-primary-foreground/10" />
                  ) : (
                    <div className="w-[300px] h-[600px] bg-gray-800" />
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 3 — FEATURE DEEP-DIVES (alternating)
      ───────────────────────────────────────────────────────────────── */}

      {/* Feature A — Smart Search */}
      <section className="w-full py-20 md:py-28 bg-background overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
                <Search className="h-4 w-4" /> Smart Search
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-headline leading-tight">
                Identify any grass<br />in minutes
              </h2>
              <p className="mt-5 text-muted-foreground text-lg leading-relaxed max-w-lg">
                The award-winning Smart Search filters and ranks your species list as you
                describe the plant — narrowing 390 species down to a handful of candidates fast.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Filter by plant height, leaf width, inflorescence type and more",
                  "Ranked results — most likely match shown first",
                  "Build custom lists by ecological group, grazing value, or uses",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <PhoneShell priority />
            </div>
          </div>
        </div>
      </section>

      {/* Feature B — GPS & Location */}
      <section className="w-full py-20 md:py-28 bg-primary/5 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center">
              <PhoneShell />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
                <MapPin className="h-4 w-4" /> GPS & Location
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-headline leading-tight">
                Your location,<br />your species list
              </h2>
              <p className="mt-5 text-muted-foreground text-lg leading-relaxed max-w-lg">
                The app uses your GPS position to show only the grass species that occur in
                your immediate area — making identification dramatically faster in the field.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Current GPS position or select any location on the map",
                  "Coverage across all seven southern African countries",
                  "Interactive distribution maps per species",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature C — Species Database */}
      <section className="w-full py-20 md:py-28 bg-background overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
                <Camera className="h-4 w-4" /> Species Database
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-headline leading-tight">
                2 000+ images,<br />one species at a time
              </h2>
              <p className="mt-5 text-muted-foreground text-lg leading-relaxed max-w-lg">
                Every species comes with up to 10 diagnostic photos, a full written description,
                grazing value, ecological notes, and a distribution map — all stored on your device.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "3–10 photos per species: whole plant, inflorescence, spikelets, leaves",
                  "Grazing value, ecological status, and weediness at a glance",
                  "Fully offline — no signal needed anywhere in the field",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <PhoneShell />
            </div>
          </div>
        </div>
      </section>

      {/* App functions accordion */}
      <section className="w-full py-16 md:py-20 bg-muted/40 border-y">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold font-headline text-center mb-2">
            Explore every function
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-8">
            A complete overview of everything GrassPro can do.
          </p>
          <Accordion type="single" collapsible defaultValue="smart-search" className="w-full">
            {accordionItems.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger className="text-left font-semibold text-sm">
                  {item.trigger}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-6 text-center">
            <Button asChild variant="outline" className="border-primary/30 hover:border-primary">
              <Link href="/resources">
                <FileDown className="mr-2 h-4 w-4" /> Download full PDF user guide
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 4 — ENDORSEMENT STRIP
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-background border-b py-5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Endorsed by the <strong className="text-foreground">Grassland Society of Southern Africa</strong></span>
            <span className="hidden sm:block text-border">·</span>
            <span>Supported by <strong className="text-foreground">Briza Publications</strong></span>
            <span className="hidden sm:block text-border">·</span>
            <span>Launched at the 58th GSSA Congress, July 2023</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 5 — PRICING
      ───────────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 md:py-28 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-headline">Simple pricing</h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Start for free, upgrade when you&rsquo;re ready. No hidden costs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free card */}
            <div className="rounded-2xl border-2 border-border p-8">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Evaluation version</p>
              <p className="text-5xl font-bold font-headline">Free</p>
              <p className="text-muted-foreground mt-1 text-sm">Always free to download</p>
              <ul className="mt-8 space-y-3">
                {[
                  "50 sample grass species",
                  "Full Smart Search functionality",
                  "GPS-based location filtering",
                  "Distribution maps",
                  "Fully offline",
                  "iOS & Android",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-2">
                <Button asChild variant="outline" className="w-full border-2">
                  <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer">
                    <PlayStoreSVG /> Google Play
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full border-2">
                  <a href={APP_STORE} target="_blank" rel="noopener noreferrer">
                    <AppStoreSVG /> App Store
                  </a>
                </Button>
              </div>
            </div>

            {/* Full version card */}
            <div className="rounded-2xl border-2 border-primary bg-primary text-primary-foreground p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                Recommended
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary-foreground/60 mb-2">Full version</p>
              <div className="flex items-end gap-1">
                <p className="text-5xl font-bold font-headline">R199.99</p>
                <span className="text-primary-foreground/60 mb-1">/year</span>
              </div>
              <p className="text-primary-foreground/60 mt-1 text-sm">Includes all future expansions &amp; upgrades</p>
              <ul className="mt-8 space-y-3">
                {[
                  "All 390 grass species unlocked",
                  "Full Smart Search & species lists",
                  "GPS & location filtering",
                  "2 000+ diagnostic images",
                  "Full descriptions & distribution maps",
                  "Sightings log with GPS coordinates",
                  "28 southern African language names",
                  "All future updates free",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
                    <span className="text-primary-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-xs text-primary-foreground/50 text-center">
                Upgrade via &ldquo;Purchase Options&rdquo; inside the app
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 6 — WHO IT'S FOR
      ───────────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 md:py-28 bg-muted/40 border-y">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-headline">Who uses GrassPro?</h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Used by professionals and enthusiasts who work with Southern African grass and veld.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {audiences.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-3 p-5 bg-background rounded-xl border-2 border-border hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div className="bg-primary/10 rounded-full p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 7 — DOWNLOAD CTA
      ───────────────────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-32 bg-primary text-primary-foreground text-center">
        <div className="container px-4 md:px-6">
          <p className="text-primary-foreground/50 text-sm font-semibold uppercase tracking-widest mb-4">
            Available on iOS &amp; Android
          </p>
          <h2 className="text-5xl md:text-6xl font-bold font-headline">
            Download GrassPro
          </h2>
          <p className="mt-4 text-primary-foreground/70 text-lg max-w-md mx-auto">
            Free to download. Start identifying grasses today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold h-14 px-8 text-base shadow-xl">
              <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer">
                <PlayStoreSVG /> Google Play
              </a>
            </Button>
            <Button asChild size="lg" className="bg-white/10 text-white hover:bg-white/20 border border-white/25 font-bold h-14 px-8 text-base">
              <a href={APP_STORE} target="_blank" rel="noopener noreferrer">
                <AppStoreSVG /> App Store
              </a>
            </Button>
          </div>
          <p className="mt-4 text-primary-foreground/40 text-xs">
            Free · 50 species included · Upgrade to full version for R199.99/year
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          QUESTIONS CTA
      ───────────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 md:py-20 bg-background border-t">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold font-headline">Questions about GrassPro?</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Having trouble identifying a species, or want to know if the app is right
            for your work? Ask Frits directly.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-whatsapp hover:bg-whatsapp-hover text-white border-b-4 border-black/20">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="mr-2 h-5 w-5" /> WhatsApp Frits
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2">
              <Link href="/contact">Send a Message <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
