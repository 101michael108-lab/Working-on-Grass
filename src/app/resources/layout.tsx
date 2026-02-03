
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides & Reference Materials",
  description: "Access practical resources for grass identification, veld monitoring, and sustainable grazing management developed from decades of field experience.",
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
