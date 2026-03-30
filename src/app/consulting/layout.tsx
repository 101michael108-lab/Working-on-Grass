
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expert Veld Management Services",
  description: "Professional veld assessments, grazing planning, and ecological advisory. Expert guidance for farmers, nature reserves, and industrial land rehabilitation.",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
