import type { Metadata, Viewport } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/cart-context";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { MediaProvider } from "@/context/media-context";

export const viewport: Viewport = {
  themeColor: "#1a3a1a", // Deep Forest Green matching the brand's primary identity
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://workingongrass.co.za'),
  title: {
    default: "Working on Grass | Veld & Pasture Management Southern Africa",
    template: "%s | Working on Grass"
  },
  description: "Professional environmental and agricultural services for sustainable and regenerative land use in Southern Africa. Led by ecologist Frits van Oudtshoorn.",
  keywords: ["veld management", "pasture assessment", "grass identification", "Southern Africa", "disc pasture meter", "regenerative agriculture", "Frits van Oudtshoorn"],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Working on Grass',
    alternateName: 'Africa Land-Use Training',
    url: 'https://workingongrass.co.za',
    logo: 'https://workingongrass.co.za/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+27-78-228-0008',
      contactType: 'technical support',
      areaServed: 'ZA',
      availableLanguage: ['English', 'Afrikaans']
    },
    sameAs: [
      'https://www.facebook.com/workingongrass',
      // Add other social links here
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
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
