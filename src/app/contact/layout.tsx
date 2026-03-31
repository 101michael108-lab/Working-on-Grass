
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Working on Grass",
  description: "Get in touch with Frits van Oudtshoorn for expert assessments, technical support, or general inquiries about our land management services.",
  alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
