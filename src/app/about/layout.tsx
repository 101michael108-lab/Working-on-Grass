
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Frits van Oudtshoorn",
  description: "Learn about Working on Grass and ecologist Frits van Oudtshoorn — MSc Nature Conservation, 30 years of veld assessments, author of Guide to Grasses of Southern Africa.",
  alternates: { canonical: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
