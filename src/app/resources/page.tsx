import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Download,
  Calculator,
  Map,
  List,
  BookOpen,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Free Veld & Grassland Resources",
  description:
    "Free downloadable guides, checklists, equations, and maps for veld and grassland management in Southern Africa — by Frits van Oudtshoorn.",
  alternates: { canonical: "/resources" },
};

type ResourceItem = {
  title: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  downloadHref: string;
  relatedHref?: string;
  relatedLabel?: string;
  fileType: string;
};

const resources: ResourceItem[] = [
  {
    title: "Disc Pasture Meter (DPM) — Equations & Methodology",
    description:
      "The calibration equations and step-by-step methodology for using the Disc Pasture Meter to estimate grass biomass (kg DM/ha) across different veld types and regions of Southern Africa. Essential reading before first use.",
    icon: Calculator,
    badge: "Free Download",
    badgeColor: "bg-primary text-white",
    downloadHref: "#",
    relatedHref: "/shop",
    relatedLabel: "Buy the Disc Pasture Meter",
    fileType: "PDF",
  },
  {
    title: "Common Grasses Checklist — Southern Africa",
    description:
      "A printable checklist of the most commonly encountered grasses across Southern African veld types, with columns for recording presence, abundance, and condition. Useful for rapid field assessments.",
    icon: List,
    badge: "Free Download",
    badgeColor: "bg-primary text-white",
    downloadHref: "#",
    relatedHref: "/shop",
    relatedLabel: "Get the Guide to Grasses book",
    fileType: "PDF",
  },
  {
    title: "Scientific Name Reference List — Southern African Grasses",
    description:
      "Full cross-reference of common and scientific names for the 320 grass species covered in Guide to Grasses of Southern Africa (3rd ed.). Useful for reports, EIAs, and herbarium work.",
    icon: FileText,
    badge: "Free Download",
    badgeColor: "bg-primary text-white",
    downloadHref: "#",
    relatedHref: "/shop",
    relatedLabel: "Get the Guide to Grasses book",
    fileType: "PDF",
  },
  {
    title: "Vegetation Bioregion Maps — Southern Africa",
    description:
      "Maps showing the major grassland and savanna bioregions of Southern Africa, based on the recognised biome classification system. Useful for contextualising species distribution and veld type assessments.",
    icon: Map,
    badge: "Free Download",
    badgeColor: "bg-primary text-white",
    downloadHref: "#",
    relatedHref: "/consulting",
    relatedLabel: "Discuss a veld assessment",
    fileType: "PDF",
  },
  {
    title: "Veld Condition Assessment — Field Score Sheet",
    description:
      "A practical field score sheet for recording veld condition using the standard plant species composition method. Includes scoring criteria, species categories, and interpretation guidelines.",
    icon: FileText,
    badge: "Free Download",
    badgeColor: "bg-primary text-white",
    downloadHref: "#",
    relatedHref: "/consulting",
    relatedLabel: "Request a professional assessment",
    fileType: "PDF",
  },
  {
    title: "GrassPro — Quick Start Guide",
    description:
      "A brief illustrated guide to getting started with the GrassPro app — how to use Smart Search, interpret distribution maps, and log sightings. Ideal for first-time users.",
    icon: BookOpen,
    badge: "Free Download",
    badgeColor: "bg-primary text-white",
    downloadHref: "#",
    relatedHref: "/grassPro",
    relatedLabel: "Download GrassPro",
    fileType: "PDF",
  },
];

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

      <div className="container py-12 md:py-20">
        {/* Header */}
        <div className="mb-14 text-center">
          <Badge className="bg-primary text-white uppercase tracking-widest px-3 mb-3">
            Free Resources
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
            Veld & Grassland Resources
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground font-body">
            Practical guides, checklists, equations, and maps for field use —
            freely available from Frits van Oudtshoorn and Working on Grass.
            More resources are added regularly.
          </p>
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <Card
              key={index}
              className="flex flex-col border-2 hover:border-primary/40 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="bg-primary/10 p-2 rounded-md shrink-0">
                    <resource.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shrink-0 ${resource.badgeColor}`}
                  >
                    {resource.fileType}
                  </span>
                </div>
                <CardTitle className="text-lg leading-tight mt-2 font-headline">
                  {resource.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-sm leading-relaxed">
                  {resource.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-0">
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="sm">
                  <a href={resource.downloadHref} download>
                    <Download className="mr-2 h-4 w-4" /> Download Free
                  </a>
                </Button>
                {resource.relatedHref && (
                  <Button asChild variant="ghost" size="sm" className="w-full text-primary hover:text-primary">
                    <Link href={resource.relatedHref}>
                      {resource.relatedLabel}{" "}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* More Resources Notice */}
        <div className="mt-12 bg-secondary/40 border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
          <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold font-headline text-xl">More PDFs Coming</h3>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
            Additional resources — including specific DPM equations per region,
            grass composition survey templates, and bioregion-specific
            checklists — will be added here as they are prepared.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold font-headline">
            Need guidance specific to your land?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            These resources are a starting point. A professional on-site
            assessment gives you specific recommendations for your farm, reserve,
            or project — not generic advice.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#25D366] text-white hover:bg-[#1ebe5d]"
            >
              <a
                href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20discuss%20a%20veld%20assessment."
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp Frits
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2">
              <Link href="/consulting">View Consulting Services</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
