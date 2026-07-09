"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useMedia } from "@/context/media-context";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/shop/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  Container,
  Eyebrow,
  SectionHead,
  InlineArrowLink,
  ctaPrimary,
  ctaOutline,
  ctaLight,
} from "@/components/redesign/ui";

const WA_CONSULT =
  "https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20request%20a%20consultation.";

export default function Home() {
  const { getImage } = useMedia();
  const heroImage = getImage("hero");
  const aboutImage = getImage("about-frits");

  const firestore = useFirestore();
  const featuredQuery = useMemoFirebase(
    () => query(collection(firestore, "products"), orderBy("name"), limit(3)),
    [firestore]
  );
  const { data: featured, isLoading } = useCollection<Omit<Product, "id">>(featuredQuery);

  return (
    <div className="bg-cream">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <Container>
        <div className="grid grid-cols-1 border-b border-line min-[940px]:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center py-[52px] min-[940px]:py-20 min-[940px]:pr-14">
            <Eyebrow tone="green" rule className="mb-6">
              Grassland ecology · Southern Africa
            </Eyebrow>
            <h1 className="m-0 font-headline text-[clamp(38px,4.4vw,62px)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
              The trusted authority on{" "}
              <span className="italic text-forest">veld &amp; pasture</span> management.
            </h1>
            <p className="mt-6 max-w-[500px] text-[17px] leading-[1.65] text-body">
              Thirty years of veld assessments, rehabilitation and grazing science, put to work in
              the books, instruments and counsel that South African farmers, reserves and
              rehabilitation teams rely on. Led by ecologist Frits van Oudtshoorn.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/shop" className={ctaPrimary}>
                Browse the shop
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/consulting" className={ctaOutline}>
                Request a consultation
              </Link>
            </div>
            <div className="mt-5 flex items-center gap-2 text-[13px] text-body-soft">
              <WhatsAppIcon className="h-4 w-4 text-[#4a8f5f]" />
              <span>
                or WhatsApp Frits directly ·{" "}
                <a href={WA_CONSULT} target="_blank" rel="noopener noreferrer" className="font-mono text-body no-underline hover:text-forest">
                  +27 78 228 0008
                </a>
              </span>
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden border-line bg-cream-band min-[940px]:min-h-[520px] min-[940px]:border-l">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description || "Open veld under a clear South African sky"}
                fill
                priority
                sizes="(min-width:940px) 47vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
        </div>
      </Container>

      {/* ── CREDENTIALS STRIP ────────────────────────────────── */}
      <section className="border-b border-line bg-cream-band">
        <Container className="grid grid-cols-1 max-[720px]:gap-0 min-[721px]:grid-cols-3">
          {[
            ["30", "yr", "Hands-on veld assessment & fieldwork"],
            ["390", "", "Grass species documented across Southern Africa"],
            ["2", "", "Standard-reference books authored & in print"],
          ].map(([num, unit, label], i) => (
            <div
              key={i}
              className={`flex items-center gap-4 py-[26px] ${i > 0 ? "min-[721px]:border-l min-[721px]:border-line min-[721px]:pl-[30px]" : ""} ${i < 2 ? "min-[721px]:pr-[30px]" : ""} max-[720px]:border-t max-[720px]:border-line max-[720px]:first:border-t-0`}
            >
              <span className="font-headline text-[34px] font-semibold leading-none text-forest">
                {num}
                {unit && <span className="text-[17px]">{unit}</span>}
              </span>
              <span className="text-[13.5px] font-medium leading-[1.45] text-body-soft">{label}</span>
            </div>
          ))}
        </Container>
      </section>

      {/* ── FROM THE SHOP ────────────────────────────────────── */}
      <Container className="pb-10 pt-[clamp(56px,7vw,90px)]">
        <div className="mb-11 flex items-end justify-between gap-5 border-b border-line pb-[22px]">
          <SectionHead eyebrow="The Catalogue" title="Books & field instruments" />
          <InlineArrowLink href="/shop">View all</InlineArrowLink>
        </div>
        <div className="grid grid-cols-1 gap-[26px] min-[560px]:grid-cols-2 min-[880px]:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[420px]" />)
            : featured?.map((p) => <ProductCard key={p.id} product={p as Product} />)}
        </div>
      </Container>

      {/* ── MEET FRITS (dark band) ───────────────────────────── */}
      <section className="mt-[60px] border-t border-line bg-forest-bark text-ondark">
        <Container>
          <div className="grid grid-cols-1 min-[940px]:grid-cols-[0.85fr_1.15fr]">
            <div className="relative min-h-[340px] overflow-hidden bg-[rgba(255,255,255,0.03)] min-[940px]:min-h-[520px] min-[940px]:border-r min-[940px]:border-[rgba(237,239,232,0.14)]">
              {aboutImage && (
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description || "Frits van Oudtshoorn"}
                  fill
                  sizes="(min-width:940px) 40vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-col justify-center py-14 min-[940px]:py-20 min-[940px]:pl-16">
              <div className="mb-[22px] font-body text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
                The Author
              </div>
              <blockquote className="m-0 mb-7 font-headline text-[clamp(22px,2.4vw,29px)] font-normal italic leading-[1.42] tracking-[-0.01em] text-ondark-bright">
                &ldquo;My goal is to bridge the gap between science and the farmer, because
                sustainable land builds resilient, profitable businesses for generations.&rdquo;
              </blockquote>
              <p className="m-0 max-w-[560px] text-[15.5px] leading-[1.7] text-ondark-soft">
                Frits van Oudtshoorn has spent three decades on veld assessments, rehabilitation
                projects and grazing-capacity studies across Southern Africa. He is the author of the{" "}
                <span className="font-medium text-ondark">Guide to Grasses of Southern Africa</span>{" "}
                and{" "}
                <span className="font-medium text-ondark">Veld Management: Principles &amp; Practices</span>,
                and a registered Barenbrug seed agent.
              </p>
              <div className="mt-[26px] flex flex-wrap gap-9 border-t border-[rgba(237,239,232,0.14)] pt-[26px]">
                <div>
                  <div className="font-headline text-[15px] text-ondark">MSc Nature Conservation</div>
                  <div className="mt-[3px] text-[12px] text-[#87938A]">Ecological Restoration</div>
                </div>
                <div>
                  <div className="font-headline text-[15px] text-ondark">Barenbrug SA</div>
                  <div className="mt-[3px] text-[12px] text-[#87938A]">Registered seed agent</div>
                </div>
              </div>
              <Link href="/about" className={`mt-[34px] self-start ${ctaLight}`}>
                More about Frits
                <ArrowRight className="h-[15px] w-[15px]" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── TWO PATHS ────────────────────────────────────────── */}
      <Container className="py-[clamp(56px,7vw,90px)]">
        <SectionHead center eyebrow="Where to begin" title="How can we help you?" className="mb-11" />
        <div className="grid grid-cols-1 gap-[26px] min-[720px]:grid-cols-2">
          <div className="flex flex-col border border-line bg-cream-card p-[clamp(28px,4vw,44px)] shadow-lifted">
            <div className="mb-[22px] flex h-11 w-11 items-center justify-center rounded-[3px] bg-cream-band">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2E4A34" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10M10 20c5.5-2.5.42-8.5-1-11-1.42 2.5-6.5 8.5-1 11M12 9v11" /></svg>
            </div>
            <h3 className="m-0 mb-3 font-headline text-[24px] font-semibold text-ink">Need a consultation?</h3>
            <p className="m-0 mb-7 flex-grow text-[14.5px] leading-[1.6] text-body-soft">
              Frits works directly with farmers, game reserves and land managers, veld assessments,
              grazing-capacity studies, rehabilitation plans and grazing management, tailored to your
              specific land.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={WA_CONSULT} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-[3px] bg-forest px-[22px] py-3 text-[13.5px] font-semibold text-ondark-bright no-underline hover:bg-forest-dark">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp Frits
              </a>
              <Link href="/consulting" className="inline-flex items-center rounded-[3px] border border-line-strong px-[18px] py-3 text-[13.5px] font-semibold text-forest no-underline hover:border-forest">
                View services
              </Link>
            </div>
          </div>

          <div className="flex flex-col border border-line bg-cream-card p-[clamp(28px,4vw,44px)] shadow-lifted">
            <div className="mb-[22px] flex h-11 w-11 items-center justify-center rounded-[3px] bg-cream-band">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2E4A34" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
            </div>
            <h3 className="m-0 mb-3 font-headline text-[24px] font-semibold text-ink">Looking for books or tools?</h3>
            <p className="m-0 mb-7 flex-grow text-[14.5px] leading-[1.6] text-body-soft">
              The <span className="font-medium text-ink">Guide to Grasses</span>, Disc Pasture Meters,
              field charts and the GrassPro app, every resource Frits uses and recommends, available
              to order directly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="inline-flex items-center gap-2 rounded-[3px] bg-forest px-[22px] py-3 text-[13.5px] font-semibold text-ondark-bright no-underline hover:bg-forest-dark">
                Browse the shop
              </Link>
              <Link href="/seeds" className="inline-flex items-center rounded-[3px] border border-line-strong px-[18px] py-3 text-[13.5px] font-semibold text-forest no-underline hover:border-forest">
                Seed enquiries
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
