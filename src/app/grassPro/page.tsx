
import type { Metadata } from "next";
import { GrassProClient } from "@/components/grassPro/GrassProClient";

export const metadata: Metadata = {
  title: "GrassPro App — Grass Identification for Southern Africa",
  description:
    "Identify grasses of Southern Africa with GrassPro — 1,400+ diagnostic images, GPS filtering, offline mode, and sightings logging. Free download on iOS and Android. Developed by Frits van Oudtshoorn.",
  alternates: { canonical: "/grassPro" },
};

const PLAY_STORE =
  "https://play.google.com/store/apps/details?id=za.co.highbranching.grasspro";
const APP_STORE = "https://apps.apple.com/za/app/grasspro/id1586118050";

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
      <GrassProClient />
    </>
  );
}
