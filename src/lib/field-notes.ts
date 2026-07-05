import { getAdminFirestore } from "@/lib/firebase-admin";
import type { FieldNote } from "@/lib/types";

/** Normalised note with publishedAt coerced to a JS Date for server rendering. */
export type LoadedFieldNote = Omit<FieldNote, "publishedAt" | "updatedAt"> & {
  publishedAt: Date;
};

function toDate(v: any): Date {
  if (!v) return new Date(0);
  if (typeof v?.toDate === "function") return v.toDate();
  if (typeof v?.seconds === "number") return new Date(v.seconds * 1000);
  return new Date(v);
}

function normalise(id: string, data: any): LoadedFieldNote {
  return {
    id,
    slug: data.slug,
    title: data.title,
    deck: data.deck ?? "",
    category: data.category ?? "Field Notes",
    coverImageUrl: data.coverImageUrl,
    takeaways: data.takeaways ?? [],
    body: data.body ?? "",
    pullQuote: data.pullQuote,
    relatedProductId: data.relatedProductId,
    readMinutes: data.readMinutes,
    isPublished: data.isPublished ?? false,
    publishedAt: toDate(data.publishedAt),
  };
}

/** All published notes, newest first. Sorted in memory (no composite index). */
export async function getPublishedFieldNotes(): Promise<LoadedFieldNote[]> {
  const db = getAdminFirestore();
  const snap = await db.collection("fieldNotes").where("isPublished", "==", true).get();
  return snap.docs
    .map((d) => normalise(d.id, d.data()))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

/** A single published note by slug, or null. */
export async function getFieldNoteBySlug(slug: string): Promise<LoadedFieldNote | null> {
  const db = getAdminFirestore();
  const snap = await db.collection("fieldNotes").where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const note = normalise(snap.docs[0].id, snap.docs[0].data());
  return note.isPublished ? note : null;
}

/** Estimated reading time in minutes (~200 wpm), min 1. */
export function readingMinutes(note: Pick<FieldNote, "body" | "readMinutes">): number {
  if (note.readMinutes && note.readMinutes > 0) return note.readMinutes;
  const words = (note.body || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatNoteDate(d: Date): string {
  return d.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
}
