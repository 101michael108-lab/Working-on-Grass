"use client";

import Link from "next/link";
import { FileText, Download, Map, List, BookOpen, ArrowRight, Video, FileCheck, Newspaper } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Resource } from "@/lib/types";
import { Container, Eyebrow } from "@/components/redesign/ui";

const TYPE_ICONS: Record<string, React.ElementType> = {
  PDF: FileText, Video, Article: Newspaper, Template: FileCheck, Guide: BookOpen, Map, Checklist: List,
};

export default function ResourcesClient() {
  const firestore = useFirestore();
  const resourcesQuery = useMemoFirebase(
    () => query(collection(firestore, "resources"), orderBy("createdAt", "desc")),
    [firestore]
  );
  const { data: allResources, isLoading } = useCollection<Omit<Resource, "id">>(resourcesQuery);
  const resources = allResources?.filter((r) => r.isPublished).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-cream-band">
        <Container className="py-[clamp(48px,6vw,72px)] pb-[clamp(40px,5vw,56px)]">
          <Eyebrow rule tone="green" className="mb-4">Field resources</Eyebrow>
          <h1 className="m-0 font-headline text-[clamp(34px,4.4vw,56px)] font-medium leading-[1.06] tracking-[-0.02em] text-ink">Veld &amp; grassland resources</h1>
          <p className="m-0 mt-[18px] max-w-[620px] font-body text-[17px] leading-[1.65] text-body">Practical guides, checklists, equations and maps for field use — freely available from Frits van Oudtshoorn and Working on Grass. More resources are added regularly.</p>
        </Container>
      </section>

      <Container className="py-[clamp(40px,5vw,64px)]">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 min-[640px]:grid-cols-2 min-[940px]:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[240px] rounded-[4px]" />)}
          </div>
        ) : !resources?.length ? (
          <div className="rounded-[4px] border border-dashed border-line-strong bg-cream-panel py-20 text-center">
            <FileText className="mx-auto mb-3 h-9 w-9 text-body-faint" strokeWidth={1.5} />
            <p className="m-0 font-medium text-body">No resources available yet.</p>
            <p className="m-0 mt-1 text-[13px] text-body-soft">Check back soon — resources are being added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 min-[640px]:grid-cols-2 min-[940px]:grid-cols-3">
            {resources.map((resource) => {
              const Icon = TYPE_ICONS[resource.resourceType] || FileText;
              return (
                <div key={resource.id} className="flex flex-col rounded-[4px] border border-line bg-cream-card p-6 shadow-lifted transition-shadow hover:shadow-lifted-lg">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] bg-cream-band"><Icon className="h-5 w-5 text-forest" strokeWidth={1.6} /></div>
                    <span className="shrink-0 rounded-[2px] border border-gold-border bg-gold-bg px-2 py-1 font-body text-[10px] font-bold uppercase tracking-[0.12em] text-gold-text">{resource.resourceType}</span>
                  </div>
                  <h3 className="m-0 mb-2 font-headline text-[18px] font-semibold leading-tight text-ink">{resource.title}</h3>
                  <p className="m-0 flex-grow text-[13.5px] leading-[1.6] text-body-soft">{resource.description}</p>
                  <div className="mt-5 flex flex-col gap-2.5">
                    {resource.fileUrl ? (
                      <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" download className="inline-flex items-center justify-center gap-2 rounded-[3px] bg-forest py-2.5 text-[13.5px] font-semibold text-ondark-bright no-underline transition-colors hover:bg-forest-dark">
                        <Download className="h-4 w-4" /> Download free
                      </a>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2 rounded-[3px] border border-line-strong py-2.5 text-[13.5px] font-semibold text-body-faint"><Download className="h-4 w-4" /> Coming soon</span>
                    )}
                    {resource.relatedHref && resource.relatedLabel && (
                      <Link href={resource.relatedHref} className="inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-forest no-underline hover:underline">
                        {resource.relatedLabel} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && (
          <div className="mt-10 rounded-[4px] border border-dashed border-line-strong bg-cream-panel p-8 text-center">
            <FileText className="mx-auto mb-3 h-7 w-7 text-forest" strokeWidth={1.5} />
            <h3 className="m-0 font-headline text-[19px] font-semibold text-ink">More resources coming</h3>
            <p className="m-0 mx-auto mt-2 max-w-xl text-[13.5px] leading-[1.6] text-body-soft">Additional resources including specific DPM equations per region, grass-composition survey templates, and bioregion-specific checklists will be added here as they are prepared.</p>
          </div>
        )}
      </Container>

      {/* CTA */}
      <section className="border-t border-line bg-cream-band">
        <Container className="py-[clamp(44px,5.5vw,68px)] text-center">
          <h2 className="m-0 font-headline text-[clamp(24px,3vw,32px)] font-medium tracking-[-0.02em] text-ink">Need guidance specific to your land?</h2>
          <p className="m-0 mx-auto mt-3 max-w-2xl text-[15px] leading-[1.6] text-body-soft">These resources are a starting point. A professional on-site assessment gives you specific recommendations for your farm, reserve or project — no generic advice.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20discuss%20a%20veld%20assessment." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 rounded-[3px] bg-[#25D366] px-6 py-[13px] text-[14px] font-semibold text-white no-underline transition-opacity hover:opacity-90"><WhatsAppIcon className="h-[18px] w-[18px]" /> WhatsApp Frits</a>
            <Link href="/consulting" className="inline-flex items-center gap-2 rounded-[3px] border border-line-strong px-6 py-[13px] text-[14px] font-semibold text-forest no-underline transition-colors hover:border-forest">View consulting services</Link>
          </div>
        </Container>
      </section>
    </>
  );
}
