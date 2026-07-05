import Image from "next/image";
import Link from "next/link";
import type { LoadedFieldNote } from "@/lib/field-notes";
import { formatNoteDate, readingMinutes } from "@/lib/field-notes";
import { hatchCream } from "@/components/redesign/ui";

export function FieldNoteCard({ note }: { note: LoadedFieldNote }) {
  const href = `/field-notes/${note.slug}`;
  return (
    <article className="flex flex-col border border-line bg-cream-card animate-wog-fade">
      <Link
        href={href}
        className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-line no-underline"
        style={note.coverImageUrl ? undefined : hatchCream}
      >
        {note.coverImageUrl ? (
          <Image src={note.coverImageUrl} alt={note.title} fill sizes="(min-width:880px) 33vw, 100vw" className="object-cover" />
        ) : (
          <span className="font-body text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#A2A492]">Field note</span>
        )}
      </Link>
      <div className="flex flex-grow flex-col p-[22px]">
        <span className="mb-2.5 font-body text-[10.5px] font-semibold uppercase tracking-[0.14em] text-body-faint">{note.category}</span>
        <h3 className="mb-2.5 font-headline text-[20px] font-semibold leading-[1.22] text-ink">
          <Link href={href} className="text-ink no-underline transition-colors hover:text-forest">{note.title}</Link>
        </h3>
        <p className="mb-[18px] line-clamp-3 flex-grow text-[13.5px] leading-[1.55] text-body-soft">{note.deck}</p>
        <div className="flex items-center gap-2 border-t border-cream-line pt-3.5 text-[11.5px] text-body-faint">
          <span>{formatNoteDate(note.publishedAt)}</span>
          <span>·</span>
          <span>{readingMinutes(note)} min read</span>
        </div>
      </div>
    </article>
  );
}
