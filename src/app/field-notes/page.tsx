import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getPublishedFieldNotes, formatNoteDate, readingMinutes, type LoadedFieldNote } from "@/lib/field-notes";
import { Container, Eyebrow, hatchCream } from "@/components/redesign/ui";
import { FieldNoteCard } from "@/components/field-notes/field-note-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Field Notes",
  description:
    "Practical guidance on veld management, grass identification, grazing and rehabilitation, written from three decades of fieldwork by Frits van Oudtshoorn.",
  alternates: { canonical: "/field-notes" },
  openGraph: {
    title: "Field Notes | Working on Grass",
    description: "Practical veld, grazing and grass-identification guidance from Frits van Oudtshoorn.",
    type: "website",
    url: "/field-notes",
  },
};

async function loadNotes(): Promise<LoadedFieldNote[]> {
  try {
    return await getPublishedFieldNotes();
  } catch (e) {
    console.error("Field Notes: failed to load", e);
    return [];
  }
}

export default async function FieldNotesHub({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const notes = await loadNotes();

  const categories = [...new Set(notes.map((n) => n.category))];
  const active = topic && categories.includes(topic) ? topic : "All";
  const featured = active === "All" ? notes[0] : undefined;
  const gridNotes = active === "All" ? notes.slice(1) : notes.filter((n) => n.category === active);

  const chip = (label: string, count: number, isActive: boolean, href: string) => (
    <Link
      key={label}
      href={href}
      className={`inline-flex items-center gap-2 rounded-[3px] border px-3.5 py-2 text-[13px] font-medium no-underline transition-colors ${
        isActive ? "border-forest bg-forest text-ondark-bright" : "border-line text-body-soft hover:border-forest"
      }`}
    >
      <span>{label}</span>
      <span className="font-mono text-[11px] opacity-60">{String(count).padStart(2, "0")}</span>
    </Link>
  );

  return (
    <div className="bg-cream">
      {/* Header band */}
      <section className="border-b border-line bg-cream-band">
        <Container className="pb-[clamp(40px,5vw,56px)] pt-[clamp(48px,6vw,72px)]">
          <Eyebrow tone="green" rule className="mb-[18px]">Knowledge from the field</Eyebrow>
          <h1 className="m-0 font-headline text-[clamp(36px,4.6vw,58px)] font-medium leading-[1.04] tracking-[-0.02em] text-ink">
            Field Notes
          </h1>
          <p className="mt-[18px] max-w-[600px] text-[17px] leading-[1.65] text-body">
            Practical guidance on veld management, grass identification, grazing and rehabilitation, written from three
            decades of hands-on fieldwork by Frits van Oudtshoorn. No theory for its own sake, just what works on the land.
          </p>
        </Container>
      </section>

      {notes.length === 0 ? (
        <Container className="py-24 text-center">
          <p className="text-[15px] text-body-soft">The first field notes are being written. Check back soon.</p>
        </Container>
      ) : (
        <>
          {/* Featured */}
          {featured && (
            <Container className="pb-2 pt-[clamp(40px,5vw,56px)]">
              <div className="grid grid-cols-1 border border-line bg-cream-card shadow-lifted min-[860px]:grid-cols-[1.1fr_0.9fr]">
                <Link
                  href={`/field-notes/${featured.slug}`}
                  className="relative flex min-h-[300px] items-end justify-center overflow-hidden border-line no-underline min-[860px]:min-h-[340px] min-[860px]:border-r"
                  style={featured.coverImageUrl ? undefined : hatchCream}
                >
                  {featured.coverImageUrl ? (
                    <Image src={featured.coverImageUrl} alt={featured.title} fill sizes="(min-width:860px) 55vw, 100vw" className="object-cover" priority />
                  ) : null}
                  <span className="absolute left-4 top-4 rounded-[2px] border border-gold-border bg-gold-bg px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-[0.1em] text-gold-text">
                    Featured
                  </span>
                </Link>
                <div className="flex flex-col justify-center p-[clamp(28px,3vw,44px)]">
                  <span className="mb-3 font-body text-[10.5px] font-semibold uppercase tracking-[0.16em] text-body-faint">{featured.category}</span>
                  <h2 className="m-0 mb-3.5 font-headline text-[clamp(24px,2.6vw,32px)] font-semibold leading-[1.15] tracking-[-0.01em] text-ink">
                    <Link href={`/field-notes/${featured.slug}`} className="text-ink no-underline hover:text-forest">{featured.title}</Link>
                  </h2>
                  <p className="m-0 mb-[22px] text-[14.5px] leading-[1.6] text-body-soft">{featured.deck}</p>
                  <div className="mb-[22px] flex items-center gap-3 text-[12.5px] text-body-faint">
                    <span className="font-semibold text-body">Frits van Oudtshoorn</span>
                    <span>·</span><span>{formatNoteDate(featured.publishedAt)}</span>
                    <span>·</span><span>{readingMinutes(featured)} min read</span>
                  </div>
                  <Link href={`/field-notes/${featured.slug}`} className="inline-flex items-center gap-2 self-start rounded-[3px] bg-forest px-6 py-3 text-[14px] font-semibold text-ondark-bright no-underline hover:bg-forest-dark">
                    Read article <ArrowRight className="h-[15px] w-[15px]" />
                  </Link>
                </div>
              </div>
            </Container>
          )}

          {/* Topic filter */}
          {categories.length > 1 && (
            <Container className="pb-2 pt-9">
              <div className="flex flex-wrap gap-2.5">
                {chip("All notes", notes.length, active === "All", "/field-notes")}
                {categories.map((c) =>
                  chip(c, notes.filter((n) => n.category === c).length, active === c, `/field-notes?topic=${encodeURIComponent(c)}`)
                )}
              </div>
            </Container>
          )}

          {/* Grid */}
          <Container className="pb-[clamp(56px,7vw,90px)] pt-7">
            <div className="grid grid-cols-1 gap-[26px] min-[560px]:grid-cols-2 min-[880px]:grid-cols-3">
              {gridNotes.map((n) => (
                <FieldNoteCard key={n.id} note={n} />
              ))}
            </div>
          </Container>
        </>
      )}

      {/* Newsletter strip */}
      <section className="border-t border-line bg-forest-bark text-ondark">
        <Container className="flex flex-col items-start justify-between gap-7 py-[clamp(40px,5vw,56px)] min-[720px]:flex-row min-[720px]:items-center">
          <div>
            <h2 className="m-0 mb-2 font-headline text-[clamp(22px,2.6vw,28px)] font-medium tracking-[-0.01em] text-ondark-bright">Field notes in your inbox</h2>
            <p className="m-0 max-w-[420px] text-[14px] leading-[1.6] text-ondark-soft">Occasional, practical guidance on veld and grazing management. No spam, just what&rsquo;s useful this season.</p>
          </div>
          <a
            href="https://wa.me/27782280008?text=Hi%20Frits%2C%20please%20add%20me%20to%20the%20Field%20Notes%20list."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center rounded-[3px] bg-gold px-[22px] text-[14px] font-semibold text-forest-dark no-underline"
          >
            Subscribe via WhatsApp
          </a>
        </Container>
      </section>
    </div>
  );
}
