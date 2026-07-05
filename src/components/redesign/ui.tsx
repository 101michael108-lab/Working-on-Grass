import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

/** Page width + gutters matching the design's wog-wrap (max 1240, 40/22px). */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1240px] px-[22px] min-[940px]:px-10", className)}>
      {children}
    </div>
  );
}

/** Gold/green uppercase section label, optionally with the little rule. */
export function Eyebrow({
  children,
  tone = "gold",
  rule = false,
  className,
}: {
  children: React.ReactNode;
  tone?: "gold" | "green";
  rule?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {rule && <span className="h-[3px] w-[22px] rounded-sm bg-gold-deep" />}
      <span
        className={cn(
          "font-body text-[11px] font-bold uppercase tracking-[0.18em]",
          tone === "green" ? "text-forest" : "text-gold-deep"
        )}
      >
        {children}
      </span>
    </div>
  );
}

/** Cross-hatch fill used behind image placeholders in the design. */
export const hatchCream: React.CSSProperties = {
  backgroundImage: "repeating-linear-gradient(135deg,#ECE6D9 0 2px,#F4F0E5 2px 11px)",
};
export const hatchDark: React.CSSProperties = {
  backgroundImage: "repeating-linear-gradient(135deg,#26382A 0 2px,#213024 2px 11px)",
};

/** Shared CTA class strings — compose onto <Link>/<a>/<button>. */
export const ctaPrimary =
  "inline-flex items-center justify-center gap-2.5 rounded-[3px] bg-forest px-7 py-[15px] text-[14.5px] font-semibold text-ondark-bright no-underline transition-colors hover:bg-forest-dark";
export const ctaOutline =
  "inline-flex items-center justify-center gap-2.5 rounded-[3px] border border-line-strong px-6 py-[15px] text-[14.5px] font-semibold text-ink no-underline transition-colors hover:border-forest";
export const ctaLight =
  "inline-flex items-center justify-center gap-2.5 rounded-[3px] bg-ondark px-6 py-[13px] text-[14px] font-semibold text-ink no-underline transition-opacity hover:opacity-90";

/** Section heading pair (eyebrow + serif title). */
export function SectionHead({
  eyebrow,
  title,
  eyebrowTone = "gold",
  center = false,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  eyebrowTone?: "gold" | "green";
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(center && "text-center", className)}>
      {eyebrow && (
        <Eyebrow tone={eyebrowTone} className={cn("mb-3", center && "justify-center")}>
          {eyebrow}
        </Eyebrow>
      )}
      <h2 className="m-0 font-headline text-[clamp(28px,3.4vw,38px)] font-medium tracking-[-0.02em] text-ink">
        {title}
      </h2>
    </div>
  );
}

/** "View all →" style inline link. */
export function InlineArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 whitespace-nowrap border-b border-forest pb-1 text-[13.5px] font-semibold text-forest no-underline"
    >
      {children}
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </Link>
  );
}
