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
    en: "30 years of hands-on rangeland and pasture expertise — available to your farm or reserve.",
    af: "30 jaar praktiese weiding- en weidingkundige ondervinding — beskikbaar vir u plaas of reservaat.",
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
    en: "Frits van Oudtshoorn is a registered Barenbrug SA seed agent, offering a wide range of pasture, forage, and cover crop seed. Expert advice is provided to help you select the most suitable species for your specific needs and conditions, including the formulation of customised seed mixtures.",
    af: "Frits van Oudtshoorn is 'n geregistreerde Barenbrug SA saadagent wat 'n wye verskeidenheid weiding-, voer- en bedekkingsgewassaad bied. Kundige advies word verskaf om u te help om die mees geskikte spesies vir u spesifieke behoeftes en toestande te kies, insluitend die formulering van aangepaste saadmengsels.",
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
