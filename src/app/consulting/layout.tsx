
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veld Management Consulting",
  description: "Professional veld assessments, grazing capacity studies, and ecological rehabilitation by Frits van Oudtshoorn. Expert guidance for farms, reserves, and mine rehabilitation.",
  alternates: { canonical: '/consulting' },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
