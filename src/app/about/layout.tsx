
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Working on Grass, founded by ecologist Frits van Oudtshoorn. Discover our commitment to sustainable veld management and regenerative agriculture in Southern Africa.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
