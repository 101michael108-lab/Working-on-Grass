
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Seed Mixtures",
  description: "Request a quote for custom grass and legume seed mixtures for pasture development and land rehabilitation projects tailored to your soil type.",
};

export default function SeedsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
