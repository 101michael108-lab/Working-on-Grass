"use client";

import React, { createContext, useContext, useState } from "react";

export type Language = "en" | "af";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Translation table — add keys as needed across the site
const translations: Record<string, Record<Language, string>> = {
  // Homepage hero
  "hero.headline": {
    en: "Sustainable Veld Management, Guided by Experience",
    af: "Volhoubare Veldbeheer, Gelei deur Ondervinding",
  },
  "hero.subheadline": {
    en: "30 years of hands-on veld and grassland expertise — available to your farm or reserve.",
    af: "30 jaar praktiese veld- en grasveldkundige ondervinding — beskikbaar vir u plaas of reservaat.",
  },
  "hero.cta.whatsapp": {
    en: "WhatsApp Frits",
    af: "WhatsApp Frits",
  },
  "hero.cta.shop": {
    en: "Explore the Shop",
    af: "Blaai deur die Winkel",
  },
  // Seeds page
  "seeds.headline": {
    en: "Grass Seed Enquiries",
    af: "Graafsaad Navrae",
  },
  "seeds.subheadline": {
    en: "Frits van Oudtshoorn is a registered Barenbrug SA seed agent. All seed mixes are custom-formulated per farm, soil type, and intended use — not sold off-the-shelf.",
    af: "Frits van Oudtshoorn is 'n geregistreerde Barenbrug SA saadagent. Alle saadmengsels word op maat gemaak per plaas, grondtipe en beoogde gebruik — nie van die rak verkoop nie.",
  },
  // Consulting page
  "consulting.headline": {
    en: "Veld Management Consulting",
    af: "Veldbeheer Konsultasie",
  },
  "consulting.subheadline": {
    en: "30 years of hands-on grassland and veld expertise — available to your farm, game ranch, or reserve. Practical advice, not textbook theory.",
    af: "30 jaar praktiese gras- en veldkundige ondervinding — beskikbaar vir u plaas, wildplaas of reservaat. Praktiese raad, nie teorieboeke nie.",
  },
  // Contact
  "contact.whatsapp.label": {
    en: "tap to chat",
    af: "tik om te gesels",
  },
  // Generic
  "cta.consult": {
    en: "Request a Consultation",
    af: "Versoek 'n Konsultasie",
  },
  "cta.whatsapp": {
    en: "WhatsApp Frits",
    af: "WhatsApp Frits",
  },
  "cta.sendmessage": {
    en: "Send a Message",
    af: "Stuur 'n Boodskap",
  },
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: (key) => translations[key]?.["en"] ?? key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[key]?.[language] ?? translations[key]?.["en"] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
