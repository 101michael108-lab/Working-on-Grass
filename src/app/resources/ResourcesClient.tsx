
"use client";

import Link from "next/link";
import {
  FileText,
  Download,
  Calculator,
  Map,
  List,
  BookOpen,
  ArrowRight,
  Video,
  FileCheck,
  Newspaper,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Resource } from "@/lib/types";

const TYPE_ICONS: Record<string, React.ElementType> = {
  PDF: FileText,
  Video: Video,
  Article: Newspaper,
  Template: FileCheck,
  Guide: BookOpen,
  Map: Map,
  Checklist: List,
};

const TYPE_COLORS: Record<string, string> = {
  PDF: "bg-red-100 text-red-700",
  Video: "bg-purple-100 text-purple-700",
  Article: "bg-blue-100 text-blue-700",
  Template: "bg-green-100 text-green-700",
  Guide: "bg-amber-100 text-amber-700",
  Map: "bg-teal-100 text-teal-700",
  Checklist: "bg-orange-100 text-orange-700",
};

export default function ResourcesClient() {
  const firestore = useFirestore();

  const resourcesQuery = useMemoFirebase(
    () => query(collection(firestore, "resources"), orderBy("createdAt", "desc")),
    [firestore]
  );

  const { data: allResources, isLoading } = useCollection<Omit<Resource, "id">>(resourcesQuery);

  const resources = allResources
    ?.filter((r) => r.isPublished)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div className="container py-12 md:py-20">
      {/* Header */}
      <div className="mb-14 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
          Veld &amp; Grassland Resources
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground font-body">
          Practical guides, checklists, equations, and maps for field use, freely available from
          Frits van Oudtshoorn and Working on Grass. More resources are added regularly.
        </p>
      </div>

      {/* Resource Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-lg" />
          ))}
        </div>
      ) : !resources?.length ? (
        <div className="text-center py-20 border-2 border-dashed border-primary/20 rounded-lg">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No resources available yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon — resources are being added.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => {
            const Icon = TYPE_ICONS[resource.resourceType] || FileText;
            const typeColor = TYPE_COLORS[resource.resourceType] || "bg-muted text-muted-foreground";

            return (
              <Card
                key={resource.id}
                className="flex flex-col border-2 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="bg-primary/10 p-2 rounded-md shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shrink-0 ${typeColor}`}>
                      {resource.resourceType}
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
                  {resource.fileUrl ? (
                    <Button
                      asChild
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      size="sm"
                    >
                      <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" download>
                        <Download className="mr-2 h-4 w-4" /> Download Free
                      </a>
                    </Button>
                  ) : (
                    <Button className="w-full" size="sm" disabled>
                      <Download className="mr-2 h-4 w-4" /> Coming Soon
                    </Button>
                  )}
                  {resource.relatedHref && resource.relatedLabel && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full text-primary hover:text-primary"
                    >
                      <Link href={resource.relatedHref}>
                        {resource.relatedLabel}{" "}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* More Coming Notice */}
      {!isLoading && (
        <div className="mt-12 bg-secondary/40 border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
          <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold font-headline text-xl">More Resources Coming</h3>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
            Additional resources including specific DPM equations per region, grass composition
            survey templates, and bioregion-specific checklists will be added here as they are
            prepared.
          </p>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold font-headline">Need guidance specific to your land?</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          These resources are a starting point. A professional on-site assessment gives you
          specific recommendations for your farm, reserve, or project. No generic advice.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-whatsapp hover:bg-whatsapp-hover text-white">
            <a
              href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20discuss%20a%20veld%20assessment."
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="mr-2 h-5 w-5" /> WhatsApp Frits
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-2">
            <Link href="/consulting">View Consulting Services</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
