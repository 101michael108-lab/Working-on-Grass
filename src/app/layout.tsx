import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/cart-context";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { MediaProvider } from "@/context/media-context";

export const metadata: Metadata = {
  title: {
    default: "Working on Grass | Veld & Pasture Management Southern Africa",
    template: "%s | Working on Grass"
  },
  description: "Professional environmental and agricultural services for sustainable and regenerative land use in Southern Africa. Led by ecologist Frits van Oudtshoorn.",
  keywords: ["veld management", "pasture assessment", "grass identification", "Southern Africa", "disc pasture meter", "regenerative agriculture", "Frits van Oudtshoorn"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased")}>
        <FirebaseClientProvider>
          <MediaProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </CartProvider>
          </MediaProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
