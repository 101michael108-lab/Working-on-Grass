
import type { Metadata } from "next";
import ResourcesClient from "./ResourcesClient";

export const metadata: Metadata = {
  title: "Free Veld & Grassland Resources",
  description:
    "Free downloadable guides, checklists, equations, and maps for veld and grassland management in Southern Africa — by Frits van Oudtshoorn.",
  alternates: { canonical: "/resources" },
};

const resourcesJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Free Veld & Grassland Resources",
  description:
    "Free guides, checklists, equations and maps for veld and grassland management in Southern Africa",
  url: "https://workingongrass.co.za/resources",
  author: {
    "@type": "Person",
    name: "Frits van Oudtshoorn",
  },
};

export default function ResourcesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resourcesJsonLd) }}
      />
      <ResourcesClient />
    </>
  );
}
