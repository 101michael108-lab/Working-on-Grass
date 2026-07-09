"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Camera,
  MapPin,
  Wifi,
  Search,
  FileDown,
  ArrowRight,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useMedia } from "@/context/media-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Container, Eyebrow, ctaPrimary } from "@/components/redesign/ui";

const PLAY_STORE = "https://play.google.com/store/apps/details?id=za.co.highbranching.grasspro";
const APP_STORE = "https://apps.apple.com/za/app/grasspro/id1586118050";
const WHATSAPP = "https://wa.me/27782280008?text=Hi%20Frits%2C%20I%20have%20a%20question%20about%20the%20GrassPro%20app.";

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M3 20.5v-17c0-.6.3-1 .8-1.2L13.5 12l-9.7 9.7c-.5-.2-.8-.6-.8-1.2zm12.3-6.8l2.5 2.5-11 6.3 8.5-8.8zm3.7-1.9l-2.4 1.4-2.7-2.7 2.7-2.7 2.4 1.4c.9.5.9 1.7 0 2.6zM5.8 2.3l11 6.3-2.5 2.5-8.5-8.8z" /></svg>
);
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></svg>
);

const storeLight = "inline-flex items-center gap-2.5 rounded-[3px] bg-ondark px-[22px] py-[13px] text-[14px] font-semibold text-ink no-underline transition-opacity hover:opacity-90";

const FEATURES = [
  { icon: Camera, title: "2 000+ images", body: "Diagnostic photographs covering 390 grass species of Southern Africa." },
  { icon: MapPin, title: "GPS filtering", body: "Shows the grass species likely to occur in your immediate vicinity." },
  { icon: Wifi, title: "Works offline", body: "No signal needed once downloaded. Log sightings in the field." },
  { icon: Search, title: "Smart Search", body: "Award-winning function that filters and ranks species by their traits." },
];

const FUNCTIONS = [
  { v: "smart-search", t: "1. Smart Search", c: 'Identify a grass using various features (plant height, inflorescence type, spikelet type, leaf width, etc.). The process brings up a ranked list of grass “candidates”, from most to least likely. Smart Search also builds grass lists by uses, ecological info, geographical status, world distribution, and taxonomic ranking.' },
  { v: "grass-list", t: "2. Grass List", c: "A list of all grasses on the app (or grasses in your area if you have set your location), sortable by scientific or common name. Each entry shows an inflorescence photo and a row of at-a-glance icons: grazing value, ecological status, plant succession, life cycle, growth form, geographical status, uses and weediness." },
  { v: "species-info", t: "3. Species Information", c: "Touching an inflorescence opens the full species information: 3–10 excellent photos of the whole plant, inflorescence, spikelets and diagnostic features, a full description, a distribution range map, and the option to record the grass on your sightings list." },
  { v: "descriptions", t: "4. Grass Descriptions", c: "Each species has a detailed description: main identification features, how to distinguish it from look-alikes, habitat, uses and grazing value, world distribution, measurements, and common names in various languages — with a summary of ecological, geographical, habitat and taxonomic info." },
  { v: "distribution", t: "5. Distribution Maps", c: "Each species has a distribution map for southern Africa (south of the Zambezi and Kunene rivers), covering Botswana, Eswatini, Lesotho, Namibia, Mozambique, South Africa and Zimbabwe." },
  { v: "gps", t: "6. GPS & Location", c: "Set your current GPS position, select a location on the map, or use the whole of Southern Africa. With a location set, the app only considers grasses occurring in that area — dramatically narrowing the species pool and improving accuracy." },
  { v: "language", t: "7. Language Settings", c: "Choose a language for listing grasses. Two names show with each grass: the primary name (scientific, English or Afrikaans) and a secondary name from a choice of 28 southern African languages." },
  { v: "sightings", t: "8. Sightings Log", c: "Add species to one or more personal sightings lists — a permanent record of the grasses you have identified on a property or in a specific area." },
  { v: "offline", t: "9. Fully Offline", c: "All species data, images and content are stored on your device after installation. No internet connection is needed in the field, anywhere across Southern Africa." },
];

const AUDIENCES = ["Livestock farmers", "Game ranch managers", "Nature reserve staff", "Agricultural consultants", "Environmental practitioners", "Mine rehabilitation teams", "Veld ecologists", "Naturalists & students"];

const DEEP = [
  {
    eyebrow: "Smart Search", title: <>Identify any grass in minutes</>,
    body: "The award-winning Smart Search filters and ranks your species list as you describe the plant, narrowing 390 species down to a handful of candidates fast.",
    points: ["Filter by plant height, leaf width, inflorescence type and more", "Ranked results: most likely match shown first", "Build custom lists by ecological group, grazing value, or uses"],
    flip: false,
  },
  {
    eyebrow: "GPS & Location", title: <>Your location, your species list</>,
    body: "The app uses your GPS position to show only the grass species that occur in your immediate area, making identification dramatically faster in the field.",
    points: ["Current GPS position or select any location on the map", "Coverage across all seven southern African countries", "Interactive distribution maps per species"],
    flip: true,
  },
  {
    eyebrow: "Species database", title: <>2 000+ images, one species at a time</>,
    body: "Every species comes with up to 10 diagnostic photos, a full written description, grazing value, ecological notes, and a distribution map — all stored on your device.",
    points: ["3–10 photos per species: whole plant, inflorescence, spikelets, leaves", "Grazing value, ecological status and weediness at a glance", "Fully offline: no signal needed anywhere in the field"],
    flip: false,
  },
];

export function GrassProClient() {
  const { getImage, isLoading } = useMedia();
  const promo = getImage("grass-app-promo");

  const Phone = ({ priority = false }: { priority?: boolean }) => (
    <div className="relative mx-auto w-[240px] sm:w-[270px]">
      <div className="relative overflow-hidden rounded-[40px] border-[6px] border-[#20281f] bg-[#12180f] shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
        <div className="absolute left-1/2 top-0 z-10 h-4 w-16 -translate-x-1/2 rounded-b-2xl bg-[#12180f]" />
        {promo ? (
          <Image src={promo.imageUrl} alt={promo.description || "GrassPro app screenshot"} width={270} height={540} className="block" priority={priority} />
        ) : isLoading ? (
          <Skeleton className="h-[540px] w-[270px] rounded-none" />
        ) : (
          <div className="h-[540px] w-[270px] bg-[#12180f]" />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Hero */}
      <section className="bg-forest-bark text-ondark">
        <Container className="grid grid-cols-1 items-center gap-0 min-[940px]:grid-cols-[1.05fr_0.95fr]">
          <div className="py-[clamp(48px,6vw,84px)] min-[940px]:pr-14">
            <Eyebrow rule tone="gold" className="mb-5">The GrassPro App</Eyebrow>
            <h1 className="m-0 font-headline text-[clamp(34px,4.4vw,56px)] font-semibold leading-[1.06] tracking-[-0.02em] text-ondark-bright">Identify any grass, anywhere in the field.</h1>
            <p className="m-0 mt-[22px] max-w-[480px] font-body text-[17px] leading-[1.65] text-ondark-soft">Over 2 000 diagnostic images, GPS-based species filtering and full offline capability — the whole of Frits’s grass knowledge in your pocket. Free to try; full licence unlocks all 390 species.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" className={storeLight}><PlayIcon /> Google Play</a>
              <a href={APP_STORE} target="_blank" rel="noopener noreferrer" className={storeLight}><AppleIcon /> App Store</a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-[rgba(237,239,232,0.12)] pt-7">
              {[["390", "grass species"], ["2 000+", "diagnostic images"], ["28", "languages"], ["Free", "to start"]].map(([v, l]) => (
                <div key={l}><span className="text-[22px] font-bold text-ondark-bright">{v}</span><span className="ml-1.5 text-[13px] text-ondark-mute">{l}</span></div>
              ))}
            </div>
          </div>
          <div className="flex items-end justify-center py-10 min-[940px]:py-[clamp(40px,5vw,64px)]">
            <Phone priority />
          </div>
        </Container>
      </section>

      {/* Feature grid */}
      <Container className="py-[clamp(48px,6vw,72px)]">
        <div className="grid grid-cols-1 gap-5 min-[560px]:grid-cols-2 min-[940px]:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-[4px] border border-line bg-cream-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[3px] bg-cream-band"><Icon className="h-5 w-5 text-forest" strokeWidth={1.6} /></div>
              <h3 className="m-0 mb-1.5 font-headline text-[17px] font-semibold text-ink">{title}</h3>
              <p className="m-0 text-[13px] leading-[1.55] text-body-soft">{body}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Deep dives */}
      {DEEP.map((d) => (
        <section key={d.eyebrow} className={d.flip ? "bg-cream-band" : "bg-cream"}>
          <Container className="grid grid-cols-1 items-center gap-12 py-[clamp(40px,5vw,72px)] min-[940px]:grid-cols-2">
            <div className={d.flip ? "min-[940px]:order-2" : ""}>
              <Eyebrow tone="green" className="mb-3">{d.eyebrow}</Eyebrow>
              <h2 className="m-0 font-headline text-[clamp(26px,3.2vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] text-ink">{d.title}</h2>
              <p className="m-0 mt-4 max-w-[460px] text-[15px] leading-[1.7] text-body-soft">{d.body}</p>
              <ul className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
                {d.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[14px] text-body"><Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-forest" strokeWidth={2} />{p}</li>
                ))}
              </ul>
            </div>
            <div className={`flex justify-center ${d.flip ? "min-[940px]:order-1" : ""}`}><Phone /></div>
          </Container>
        </section>
      ))}

      {/* Functions accordion */}
      <section className="border-y border-line bg-cream-panel">
        <Container className="py-[clamp(40px,5vw,64px)]">
          <div className="mx-auto max-w-[760px]">
            <h2 className="m-0 mb-1.5 text-center font-headline text-[clamp(22px,2.6vw,28px)] font-medium tracking-[-0.02em] text-ink">Explore every function</h2>
            <p className="m-0 mb-8 text-center text-[13.5px] text-body-soft">A complete overview of everything GrassPro can do.</p>
            <Accordion type="single" collapsible defaultValue="smart-search" className="w-full">
              {FUNCTIONS.map((f) => (
                <AccordionItem key={f.v} value={f.v} className="border-line">
                  <AccordionTrigger className="text-left font-headline text-[15px] font-semibold text-ink hover:no-underline">{f.t}</AccordionTrigger>
                  <AccordionContent className="text-[13.5px] leading-[1.65] text-body-soft">{f.c}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-6 text-center">
              <Link href="/resources" className="inline-flex items-center gap-2 rounded-[3px] border border-line-strong px-5 py-3 text-[13.5px] font-semibold text-forest no-underline transition-colors hover:border-forest"><FileDown className="h-4 w-4" /> Download full PDF user guide</Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Endorsement */}
      <section className="border-b border-line bg-cream">
        <Container className="py-4">
          <p className="m-0 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center text-[13px] text-body-soft">
            <span>Endorsed by the <strong className="font-semibold text-ink">Grassland Society of Southern Africa</strong></span>
            <span className="hidden text-line-strong sm:inline">·</span>
            <span>Supported by <strong className="font-semibold text-ink">Briza Publications</strong></span>
            <span className="hidden text-line-strong sm:inline">·</span>
            <span>Launched at the 58th GSSA Congress, 2023</span>
          </p>
        </Container>
      </section>

      {/* Pricing */}
      <section className="border-b border-line bg-cream-band">
        <Container className="grid grid-cols-1 gap-6 py-[clamp(48px,6vw,72px)] min-[720px]:grid-cols-2">
          <div className="flex flex-col rounded-[4px] border border-line bg-cream-card p-9">
            <h3 className="m-0 mb-1.5 font-headline text-[22px] font-semibold text-ink">Evaluation</h3>
            <span className="font-body text-[30px] font-bold text-ink">Free</span>
            <p className="m-0 mb-5 mt-3.5 flex-grow text-[13.5px] leading-[1.6] text-body-soft">Try the app with 50 grasses included — enough to see how it works in the field.</p>
            <ul className="m-0 mb-6 flex list-none flex-col gap-2.5 p-0">
              {["50 sample grass species", "Full Smart Search", "GPS location filtering", "Fully offline · iOS & Android"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[13.5px] text-body"><Check className="h-4 w-4 shrink-0 text-forest" strokeWidth={2} />{f}</li>
              ))}
            </ul>
            <a href="#download" className="rounded-[3px] border border-line-strong py-3 text-center text-[14px] font-semibold text-forest no-underline transition-colors hover:border-forest">Download free</a>
          </div>
          <div className="relative flex flex-col rounded-[4px] border-2 border-forest bg-cream-card p-9">
            <span className="absolute -top-[11px] left-9 rounded-[2px] border border-gold-border bg-gold-bg px-2.5 py-[3px] font-body text-[10px] font-bold uppercase tracking-[0.1em] text-gold-text">Full access</span>
            <h3 className="m-0 mb-1.5 font-headline text-[22px] font-semibold text-ink">Full licence</h3>
            <span className="font-body text-[30px] font-bold text-ink">R199.99<span className="text-[14px] font-semibold text-body-faint"> / year</span></span>
            <p className="m-0 mb-5 mt-3.5 flex-grow text-[13.5px] leading-[1.6] text-body-soft">Unlocks all 390 species, every diagnostic image, GPS filtering and Smart Search — plus all future updates.</p>
            <ul className="m-0 mb-6 flex list-none flex-col gap-2.5 p-0">
              {["All 390 grass species unlocked", "2 000+ diagnostic images", "Sightings log with GPS", "28 language names · free updates"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[13.5px] text-body"><Check className="h-4 w-4 shrink-0 text-forest" strokeWidth={2} />{f}</li>
              ))}
            </ul>
            <a href="#download" className="rounded-[3px] bg-forest py-3 text-center text-[14px] font-semibold text-ondark-bright no-underline transition-colors hover:bg-forest-dark">Get the full licence</a>
            <p className="m-0 mt-3 text-center text-[11.5px] text-body-faint">Upgrade via “Purchase Options” inside the app.</p>
          </div>
        </Container>
      </section>

      {/* Audiences */}
      <Container className="py-[clamp(48px,6vw,72px)]">
        <h2 className="m-0 mb-2 text-center font-headline text-[clamp(24px,3vw,32px)] font-medium tracking-[-0.02em] text-ink">Who uses GrassPro?</h2>
        <p className="m-0 mb-9 text-center text-[14px] text-body-soft">Professionals and enthusiasts who work with Southern African grass and veld.</p>
        <div className="mx-auto grid max-w-[820px] grid-cols-2 gap-3.5 sm:grid-cols-4">
          {AUDIENCES.map((a) => (
            <div key={a} className="rounded-[4px] border border-line bg-cream-card px-4 py-5 text-center text-[13.5px] font-semibold leading-snug text-ink">{a}</div>
          ))}
        </div>
      </Container>

      {/* Download CTA */}
      <section id="download" className="bg-forest-bark text-ondark">
        <Container className="py-[clamp(56px,7vw,88px)] text-center">
          <Eyebrow tone="gold" className="mb-4 justify-center">Available on iOS &amp; Android</Eyebrow>
          <h2 className="m-0 font-headline text-[clamp(30px,4vw,48px)] font-semibold tracking-[-0.02em] text-ondark-bright">Download GrassPro</h2>
          <p className="m-0 mx-auto mt-4 max-w-[440px] text-[16px] text-ondark-soft">Free to download. Start identifying grasses today.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" className={storeLight}><PlayIcon /> Google Play</a>
            <a href={APP_STORE} target="_blank" rel="noopener noreferrer" className={storeLight}><AppleIcon /> App Store</a>
          </div>
          <p className="m-0 mt-4 text-[12px] text-ondark-mute">Free · 50 species included · Full version R199.99/year</p>
        </Container>
      </section>

      {/* Questions */}
      <Container className="py-[clamp(40px,5vw,64px)] text-center">
        <h2 className="m-0 font-headline text-[clamp(22px,2.8vw,30px)] font-medium tracking-[-0.02em] text-ink">Questions about GrassPro?</h2>
        <p className="m-0 mx-auto mt-3 max-w-[520px] text-[14.5px] leading-[1.6] text-body-soft">Trouble identifying a species, or want to know if the app fits your work? Ask Frits directly.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 rounded-[3px] bg-[#25D366] px-6 py-[13px] text-[14px] font-semibold text-white no-underline transition-opacity hover:opacity-90"><WhatsAppIcon className="h-[18px] w-[18px]" /> WhatsApp Frits</a>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-[3px] border border-line-strong px-6 py-[13px] text-[14px] font-semibold text-forest no-underline transition-colors hover:border-forest">Send a message <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </Container>
    </>
  );
}
