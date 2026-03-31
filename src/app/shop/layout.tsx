
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Books & Field Instruments",
  description: "Order the Disc Pasture Meter, Guide to Grasses of Southern Africa, and other essential veld management tools directly from Working on Grass.",
  alternates: { canonical: '/shop' },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
