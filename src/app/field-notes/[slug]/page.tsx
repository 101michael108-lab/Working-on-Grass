import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getFieldNoteBySlug, getPublishedFieldNotes, formatNoteDate, readingMinutes } from "@/lib/field-notes";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { Product } from "@/lib/types";
import { productUrl } from "@/lib/utils";
import { Container, hatchCream } from "@/components/redesign/ui";
import { FieldNoteBody } from "@/components/field-notes/field-note-body";
import { FieldNoteCard } from "@/components/field-notes/field-note-card";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://workingongrass.co.za";

const loadNote = cache(getFieldNoteBySlug);

async function loadReferencedProduct(id?: string): Promise<Product | null> {
  if (!id) return null;
  try {
    const snap = await getAdminFirestore().collection("products").doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...(snap.data() as object) } as Product;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const note = await loadNote(slug).catch(() => null);
  if (!note) return { title: "Field note not found" };
  const path = `/field-notes/${note.slug}`;
  return {
    title: note.title,
    description: note.deck,
    alternates: { canonical: path },
    openGraph: {
      title: `${note.title} | Working on Grass`,
      description: note.deck,
      type: "article",
      url: `${SITE_URL}${path}`,
      publishedTime: note.publishedAt.toISOString(),
      authors: ["Frits van Oudtshoorn"],
      images: note.coverImageUrl ? [{ url: note.coverImageUrl, alt: note.title }] : undefined,
    },
  };
}

export default async function FieldNoteArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await loadNote(slug).catch(() => null);
  if (!note) notFound();

  const [all, product] = await Promise.all([
    getPublishedFieldNotes().catch(() => []),
    loadReferencedProduct(note.relatedProductId),
  ]);
  const related = all.filter((n) => n.id !== note.id && n.category === note.category).slice(0, 3);
  const path = `/field-notes/${note.slug}`;
  const readLabel = `${readingMinutes(note)} min read`;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: note.title,
    description: note.deck,
    ...(note.coverImageUrl ? { image: note.coverImageUrl } : {}),
    datePublished: note.publishedAt.toISOString(),
    dateModified: note.publishedAt.toISOString(),
    author: { "@type": "Person", "@id": `${SITE_URL}/#frits`, name: "Frits van Oudtshoorn" },
    publisher: { "@type": "Organization", name: "Working on Grass", logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${path}` },
    articleSection: note.category,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Field Notes", item: `${SITE_URL}/field-notes` },
      { "@type": "ListItem", position: 3, name: note.title, item: `${SITE_URL}${path}` },
    ],
  };

  return (
    <div className="bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Breadcrumb */}
      <section className="border-b border-line bg-cream-band">
        <Container className="flex flex-wrap items-center gap-2 py-4 text-[12.5px] text-body-mute">
          <Link href="/" className="text-body-mute no-underline hover:text-forest">Home</Link>
          <span className="text-[#B4AE9C]">/</span>
          <Link href="/field-notes" className="text-body-mute no-underline hover:text-forest">Field Notes</Link>
          <span className="text-[#B4AE9C]">/</span>
          <span className="text-body-mute">{note.category}</span>
        </Container>
      </section>

      {/* Header */}
      <Container className="pb-2 pt-[clamp(40px,5vw,64px)]">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">{note.category}</div>
          <h1 className="m-0 font-headline text-[clamp(30px,3.6vw,46px)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink">{note.title}</h1>
          <p className="mx-auto mt-5 max-w-[640px] font-headline text-[clamp(17px,1.9vw,21px)] italic leading-[1.5] text-body">{note.deck}</p>
          <div className="mt-[26px] flex flex-wrap items-center justify-center gap-3 text-[13px] text-body-mute">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-forest text-[12px] font-bold text-ondark-bright">F</span>
            <span className="font-semibold text-ink">Frits van Oudtshoorn</span>
            <span className="text-[#B4AE9C]">·</span><span>{formatNoteDate(note.publishedAt)}</span>
            <span className="text-[#B4AE9C]">·</span><span>{readLabel}</span>
          </div>
        </div>
      </Container>

      {/* Hero image */}
      <Container className="pb-2 pt-9">
        <div className="relative flex aspect-[21/9] items-center justify-center overflow-hidden rounded-[4px] border border-line" style={note.coverImageUrl ? undefined : hatchCream}>
          {note.coverImageUrl ? (
            <Image src={note.coverImageUrl} alt={note.title} fill sizes="(min-width:1240px) 1160px, 100vw" className="object-cover" priority />
          ) : (
            <span className="mb-8 rounded-[2px] border border-line-strong bg-[rgba(244,241,233,0.7)] px-3.5 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9A9784]">
              {note.category}
            </span>
          )}
        </div>
      </Container>

      {/* Body */}
      <Container className="pb-[clamp(40px,5vw,64px)] pt-[clamp(36px,4vw,52px)]">
        <div className="mx-auto max-w-[740px]">
          {note.takeaways && note.takeaways.length > 0 && (
            <div className="mb-10 rounded-[3px] border border-line border-l-[3px] border-l-forest bg-cream-band p-6">
              <div className="mb-3.5 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-forest">Key takeaways</div>
              <div className="flex flex-col gap-2.5">
                {note.takeaways.map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[14px] leading-[1.5] text-body">
                    <span className="mt-0.5 shrink-0 text-gold-deep">&#8226;</span>{t}
                  </div>
                ))}
              </div>
            </div>
          )}

          <FieldNoteBody body={note.body} />

          {note.pullQuote && (
            <blockquote className="my-9 border-l-[3px] border-gold-deep pl-6 font-headline text-[clamp(21px,2.4vw,26px)] font-medium italic leading-[1.4] tracking-[-0.01em] text-forest">
              {note.pullQuote}
            </blockquote>
          )}

          {product && (
            <div className="my-10 flex flex-wrap items-center gap-5 rounded-[4px] border border-line bg-cream-card p-5">
              <Link href={productUrl(product)} className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-line no-underline" style={product.images?.[0] ? undefined : hatchCream}>
                {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill sizes="96px" className="object-contain p-2" /> : null}
              </Link>
              <div className="min-w-[180px] flex-1">
                <div className="mb-1.5 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-gold-deep">Referenced in this article</div>
                <h3 className="m-0 mb-1 font-headline text-[19px] font-semibold text-ink">{product.name}</h3>
                <span className="font-body text-[16px] font-bold text-ink">R{product.price.toFixed(2)}</span>
              </div>
              <Link href={productUrl(product)} className="whitespace-nowrap rounded-[3px] bg-forest px-5 py-3 text-[13.5px] font-semibold text-ondark-bright no-underline hover:bg-forest-dark">View product</Link>
            </div>
          )}

          {/* Author bio */}
          <div className="mt-11 flex items-start gap-[18px] border-t border-line pt-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-line font-headline text-[22px] font-semibold text-forest" style={hatchCream}>F</div>
            <div>
              <div className="mb-1.5 font-body text-[10.5px] font-bold uppercase tracking-[0.14em] text-body-faint">Written by</div>
              <h3 className="m-0 mb-1.5 font-headline text-[19px] font-semibold text-ink">Frits van Oudtshoorn</h3>
              <p className="m-0 text-[13.5px] leading-[1.6] text-body-soft">
                Grassland ecologist with thirty years of veld assessment and rehabilitation experience across Southern
                Africa. Author of the <em>Guide to Grasses of Southern Africa</em> and <em>Veld Management: Principles &amp; Practices</em>.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-line bg-cream-band">
          <Container className="py-[clamp(48px,6vw,72px)]">
            <h2 className="m-0 mb-8 font-headline text-[clamp(24px,3vw,32px)] font-medium tracking-[-0.02em] text-ink">Keep reading</h2>
            <div className="grid grid-cols-1 gap-[26px] min-[560px]:grid-cols-2 min-[880px]:grid-cols-3">
              {related.map((n) => (
                <FieldNoteCard key={n.id} note={n} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
