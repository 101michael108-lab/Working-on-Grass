
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products & Field Tools",
  description: "Order the Disc Pasture Meter, 'Guide to Grasses of Southern Africa', and other essential field tools directly from our online shop.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
