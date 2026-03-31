
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grass Seed Enquiries",
  description: "Request a custom grass seed mix from Barenbrug SA agent Frits van Oudtshoorn. Seed mixes formulated per farm, soil type, and intended use across Southern Africa.",
  alternates: { canonical: '/seeds' },
};

export default function SeedsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
