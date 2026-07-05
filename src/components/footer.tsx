"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/logo";
import { Search } from "lucide-react";

const exploreLinks = [
  { href: "/about", label: "About" },
  { href: "/consulting", label: "Consulting" },
  { href: "/shop", label: "Shop" },
  { href: "/seeds", label: "Seeds" },
  { href: "/field-notes", label: "Field Notes" },
  { href: "/resources", label: "Resources" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-forest-bark border-t border-[rgba(237,239,232,0.1)] text-ondark-soft">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-[22px] pb-8 pt-14 min-[940px]:px-10 max-[720px]:grid-cols-2 max-[480px]:grid-cols-1 min-[721px]:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <BrandMark className="h-[30px] w-auto text-gold" />
            <span className="font-headline text-[18px] font-semibold text-[#F4F5EF]">Working on Grass</span>
          </div>
          <p className="mb-[18px] max-w-[280px] text-[13px] leading-relaxed text-ondark-mute">
            Sustainable &amp; regenerative land-use advisory since 2008. Led by grassland ecologist Frits van Oudtshoorn.
          </p>
          <Link
            href="/track-order"
            className="inline-flex items-center gap-2 rounded-[3px] border border-[rgba(237,239,232,0.25)] px-[15px] py-[9px] text-[12.5px] font-semibold text-[#EDEFE8] no-underline transition-colors hover:bg-[rgba(237,239,232,0.06)]"
          >
            <Search className="h-3.5 w-3.5" /> Track my order
          </Link>
        </div>

        {/* Contact */}
        <div>
          <div className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-ondark-faint">Contact</div>
          <div className="flex flex-col gap-3 text-[13px] leading-snug text-ondark-mute">
            <div>
              <span className="block text-[12px] font-semibold text-[#EDEFE8]">Office support</span>
              <a href="tel:+27718661331" className="font-mono text-[12.5px] text-ondark-mute no-underline hover:text-[#EDEFE8]">+27 71 866 1331</a>
            </div>
            <div>
              <span className="block text-[12px] font-semibold text-[#EDEFE8]">Frits van Oudtshoorn</span>
              <a href="tel:+27782280008" className="font-mono text-[12.5px] text-ondark-mute no-underline hover:text-[#EDEFE8]">+27 78 228 0008</a>
            </div>
            <div>
              <span className="block text-[12px] font-semibold text-[#EDEFE8]">Email</span>
              <a href="mailto:admin@workingongrass.co.za" className="text-ondark-mute no-underline hover:text-[#EDEFE8]">admin@workingongrass.co.za</a>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-ondark-faint">Location</div>
          <div className="text-[13px] leading-[1.7] text-ondark-mute">
            <span className="font-semibold text-[#EDEFE8]">Working on Grass HQ</span><br />
            Modimolle, Limpopo<br />
            0510, South Africa
          </div>
        </div>

        {/* Explore */}
        <div>
          <div className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-ondark-faint">Explore</div>
          <div className="flex flex-col gap-[9px] text-[13px]">
            {exploreLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-ondark-mute no-underline transition-colors hover:text-[#EDEFE8]">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 border-t border-[rgba(237,239,232,0.1)] px-[22px] py-[22px] text-[11.5px] text-ondark-faint min-[940px]:px-10 max-[720px]:flex-col max-[720px]:items-start">
        <span>© {new Date().getFullYear()} Working on Grass. All rights reserved.</span>
        <span className="flex flex-wrap gap-6">
          <Link href="/privacy" className="text-ondark-faint no-underline hover:text-ondark-soft">Privacy</Link>
          <Link href="/terms" className="text-ondark-faint no-underline hover:text-ondark-soft">Terms</Link>
          <span>Secure payments by PayFast</span>
          <span>Nationwide delivery</span>
        </span>
      </div>
    </footer>
  );
}
