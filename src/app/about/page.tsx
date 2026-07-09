"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMedia } from "@/context/media-context";
import { Container, Eyebrow, ctaPrimary, ctaOutline } from "@/components/redesign/ui";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://workingongrass.co.za";

const expertise = [
  "Veld condition assessment",
  "Grazing-capacity studies",
  "Grass identification",
  "Ecological restoration",
  "Mine rehabilitation",
  "Grazing management",
];

const credentials = [
  ["MSc Nature Conservation", "Ecological Restoration"],
  ["Registered Barenbrug SA seed agent", "Custom mix formulation"],
  ["Published author", "Two standard veld references"],
  ["Africa Land-Use Training (ALUT)", "Accredited training provider"],
];

export default function AboutPage() {
  const { getImage } = useMedia();
  const aboutImage = getImage("about-frits");

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#frits`,
    name: "Frits van Oudtshoorn",
    jobTitle: "Grassland Ecologist & Veld Management Consultant",
    description:
      "Southern Africa's foremost practical authority on grass identification and veld management. MSc Nature Conservation (Ecological Restoration); author of Guide to Grasses of Southern Africa and Veld Management: Principles and Practices.",
    url: `${SITE_URL}/about`,
    ...(aboutImage?.imageUrl ? { image: aboutImage.imageUrl } : {}),
    worksFor: { "@type": "Organization", name: "Working on Grass", "@id": SITE_URL },
    alumniOf: { "@type": "CollegeOrUniversity", name: "MSc Nature Conservation (Ecological Restoration)" },
    knowsAbout: [
      "Veld management",
      "Grass identification",
      "Grazing capacity assessment",
      "Ecological restoration",
      "Mine rehabilitation",
      "Southern African grasslands",
    ],
    sameAs: [
      "https://apps.apple.com/za/app/grasspro/id1586118050",
      "https://play.google.com/store/apps/details?id=za.co.highbranching.grasspro",
      "https://alut.co.za",
    ],
  };

  return (
    <div className="bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />

      {/* Hero (dark) */}
      <section className="bg-forest-bark text-ondark">
        <Container>
          <div className="grid grid-cols-1 min-[940px]:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[300px] overflow-hidden bg-[rgba(255,255,255,0.03)] min-[940px]:min-h-[460px] min-[940px]:border-r min-[940px]:border-[rgba(237,239,232,0.14)]">
              {aboutImage && (
                <Image src={aboutImage.imageUrl} alt={aboutImage.description || "Frits van Oudtshoorn"} fill sizes="(min-width:940px) 42vw, 100vw" className="object-cover" priority />
              )}
            </div>
            <div className="flex flex-col justify-center py-[clamp(48px,6vw,80px)] min-[940px]:pl-16">
              <div className="mb-[18px] font-body text-[11px] font-bold uppercase tracking-[0.18em] text-gold">The Author &amp; Ecologist</div>
              <h1 className="m-0 font-headline text-[clamp(32px,4vw,50px)] font-semibold leading-[1.08] tracking-[-0.02em] text-ondark-bright">Frits van Oudtshoorn</h1>
              <p className="mt-[18px] max-w-[520px] font-headline text-[clamp(17px,1.9vw,21px)] italic leading-[1.5] text-[#C4C7BB]">
                Southern Africa&rsquo;s foremost practical authority on grass identification and veld management.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Bio + credentials */}
      <Container className="grid grid-cols-1 items-start gap-14 pb-[clamp(40px,5vw,56px)] pt-[clamp(48px,6vw,72px)] min-[880px]:grid-cols-[1.5fr_1fr]">
        <div className="space-y-[18px] font-headline text-[18px] leading-[1.75] text-[#33382F]">
          <p className="m-0">
            For three decades, Frits van Oudtshoorn has worked across the grasslands and savannas of Southern Africa,
            conducting veld assessments, grazing-capacity studies and rehabilitation projects for commercial farmers,
            game reserves and the mining sector. He grew up on a Limpopo farm and holds a Master&rsquo;s in Nature
            Conservation, specialising in Ecological Restoration.
          </p>
          <p className="m-0">
            His two books, the{" "}
            <Link href="/shop" className="text-forest underline underline-offset-2 hover:opacity-80">Guide to Grasses of Southern Africa</Link>{" "}
            and{" "}
            <Link href="/shop" className="text-forest underline underline-offset-2 hover:opacity-80">Veld Management: Principles &amp; Practices</Link>,
            have become standard references in agricultural colleges and on farms alike. His work bridges rigorous
            grassland ecology and the day-to-day decisions that keep land productive.
          </p>
          <p className="m-0">
            Through the{" "}
            <Link href="/grassPro" className="text-forest underline underline-offset-2 hover:opacity-80">GrassPro app</Link>{" "}
            and Working on Grass, he puts that knowledge directly into the hands of the people who manage the land. He
            also runs Africa Land-Use Training (ALUT), an accredited training provider; formal courses are offered
            through ALUT at{" "}
            <a href="https://alut.co.za" target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2 hover:opacity-80">alut.co.za</a>.
          </p>
        </div>
        <div className="rounded-[4px] border border-line bg-cream-card p-7 shadow-lifted">
          <div className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-body-faint">Credentials</div>
          <div className="flex flex-col gap-4">
            {credentials.map(([title, sub]) => (
              <div key={title}>
                <div className="font-headline text-[16px] font-semibold text-ink">{title}</div>
                <div className="mt-0.5 text-[12.5px] text-body-mute">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Stats */}
      <section className="border-y border-line bg-cream-band">
        <Container className="grid grid-cols-1 max-[720px]:gap-0 min-[721px]:grid-cols-3">
          {[
            ["30", "yr", "Hands-on veld assessment & fieldwork"],
            ["390", "", "Grass species documented across Southern Africa"],
            ["2", "", "Standard-reference books authored & in print"],
          ].map(([num, unit, label], i) => (
            <div key={i} className={`flex items-center gap-4 py-[26px] ${i > 0 ? "min-[721px]:border-l min-[721px]:border-line min-[721px]:pl-[30px]" : ""} ${i < 2 ? "min-[721px]:pr-[30px]" : ""} max-[720px]:border-t max-[720px]:border-line max-[720px]:first:border-t-0`}>
              <span className="font-headline text-[34px] font-semibold leading-none text-forest">{num}{unit && <span className="text-[17px]">{unit}</span>}</span>
              <span className="text-[13.5px] font-medium leading-[1.45] text-body-soft">{label}</span>
            </div>
          ))}
        </Container>
      </section>

      {/* Areas of expertise */}
      <Container className="py-[clamp(48px,6vw,72px)]">
        <h2 className="m-0 mb-8 font-headline text-[clamp(26px,3.2vw,34px)] font-medium tracking-[-0.02em] text-ink">Areas of expertise</h2>
        <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 min-[820px]:grid-cols-3">
          {expertise.map((e) => (
            <div key={e} className="rounded-[4px] border border-line bg-cream-card p-[22px] font-headline text-[17px] font-semibold text-ink shadow-lifted">{e}</div>
          ))}
        </div>
      </Container>

      {/* CTA */}
      <section className="border-t border-line bg-cream-band">
        <Container className="flex flex-col items-start justify-between gap-6 py-[clamp(40px,5vw,56px)] min-[720px]:flex-row min-[720px]:items-center">
          <div>
            <h2 className="m-0 mb-1.5 font-headline text-[clamp(22px,2.6vw,30px)] font-medium tracking-[-0.01em] text-ink">Work with Frits, or read his work</h2>
            <p className="m-0 text-[14px] text-body-soft">Book a consultation or explore the books, instruments and app.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/consulting" className={ctaPrimary}>
              Request a consultation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/shop" className={ctaOutline}>Browse the shop</Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
