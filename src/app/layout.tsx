
import type { Metadata, Viewport } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/cart-context";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { MediaProvider } from "@/context/media-context";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { LanguageProvider } from "@/context/language-context";
import { initializeFirebase } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Spectral, Archivo, JetBrains_Mono } from "next/font/google";
import Script from "next/script";

const spectral = Spectral({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-headline", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#223A28", // Deep forest green — matches the redesigned header
};

export async function generateMetadata(): Promise<Metadata> {
  const { firestore } = initializeFirebase();
  let faviconUrl = "/favicon.ico";

  try {
    const faviconSnap = await getDoc(doc(firestore, 'siteImages', 'favicon'));
    if (faviconSnap.exists()) {
      faviconUrl = faviconSnap.data().imageUrl;
    }
  } catch (error) {
    console.warn("Layout: Failed to fetch dynamic favicon, using fallback.", error);
  }

  return {
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
    openGraph: {
      siteName: 'Working on Grass',
      locale: 'en_ZA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
    icons: {
      icon: faviconUrl,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://workingongrass.co.za',
    name: 'Working on Grass',
    url: 'https://workingongrass.co.za',
    logo: 'https://workingongrass.co.za/logo.png',
    description: 'Veld management consulting, grass seed, books, field instruments, and the GrassPro grass identification app, by grassland ecologist Frits van Oudtshoorn.',
    telephone: '+27782280008',
    email: 'admin@workingongrass.co.za',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Modimolle',
      addressLocality: 'Modimolle',
      addressRegion: 'Limpopo',
      postalCode: '0510',
      addressCountry: 'ZA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -24.7,
      longitude: 28.4,
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Limpopo' },
      { '@type': 'AdministrativeArea', name: 'Gauteng' },
      { '@type': 'AdministrativeArea', name: 'North West' },
      { '@type': 'AdministrativeArea', name: 'Mpumalanga' },
      { '@type': 'AdministrativeArea', name: 'Free State' },
      { '@type': 'Country', name: 'South Africa' },
    ],
    priceRange: 'R-RRR',
    openingHours: 'Mo-Fr 08:00-17:00',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+27782280008',
      contactType: 'customer service',
      areaServed: 'ZA',
      availableLanguage: ['English', 'Afrikaans'],
    },
    sameAs: [
      'https://www.facebook.com/workingongrass',
    ],
    founder: {
      '@type': 'Person',
      '@id': 'https://workingongrass.co.za/#frits',
      name: 'Frits van Oudtshoorn',
      jobTitle: 'Grassland Ecologist & Veld Management Consultant',
      description: 'South Africa\'s foremost practical grass and veld expert. MSc Nature Conservation (Ecological Restoration). Author of Guide to Grasses of Southern Africa and Veld Management: Principles and Practices.',
      telephone: '+27782280008',
      email: 'admin@workingongrass.co.za',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Modimolle',
        addressRegion: 'Limpopo',
        addressCountry: 'ZA',
      },
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'University (MSc Nature Conservation, Ecological Restoration)',
      },
      knowsAbout: [
        'Veld management',
        'Grass identification',
        'Ecological restoration',
        'Grazing capacity assessment',
        'Mine rehabilitation',
        'Southern African grasslands',
      ],
      sameAs: [
        'https://apps.apple.com/za/app/grasspro/id1586118050',
        'https://play.google.com/store/apps/details?id=za.co.highbranching.grasspro',
      ],
    },
  };

  return (
    <html lang="en" className={cn(spectral.variable, archivo.variable, jetbrainsMono.variable)} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased")}>
        {/* Google Ads global site tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18311112344"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18311112344');`}
        </Script>
        <FirebaseClientProvider>
          <LanguageProvider>
          <MediaProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 overflow-x-hidden">{children}</main>
                <Footer />
              </div>
              <WhatsAppButton />
              <Toaster />
            </CartProvider>
          </MediaProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
