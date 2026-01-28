import type { Service, SeedCategory } from './types';

export const services: Service[] = [
    { 
        title: "Veld Condition & Grazing Capacity Assessments", 
        description: "We evaluate the health of your veld, measure its productivity, and estimate sustainable grazing limits to prevent overgrazing and protect long-term productivity.",
        cta: "Request Assessment",
        whoIsItFor: "For farmers, ranches, and land managers"
    },
    {
        title: "Grassland & Veld Restoration Planning",
        description: "Our team designs practical, actionable plans to restore degraded grasslands or pastures, which enhances biodiversity, improves soil health, and supports livestock productivity.",
        cta: "Discuss a Plan",
        whoIsItFor: "For properties with degraded land or pastures"
    },
    {
        title: "Ecological & Vegetation Surveys",
        description: "We provide detailed mapping and analysis of flora on your land. These surveys are often a prerequisite for Environmental Impact Assessments (EIAs), farm planning, or conservation compliance.",
        cta: "Request a Survey",
        whoIsItFor: "For EIAs, farm planning, and conservation compliance"
    },
    {
        title: "Mine Site Rehabilitation & Land Management",
        description: "We create and implement strategies to restore mined or degraded industrial sites to productive or natural states, helping you meet regulatory requirements and prevent soil erosion.",
        cta: "Contact Us",
        whoIsItFor: "For mining houses and industrial sites"
    },
    {
        title: "Grazing Management & Infrastructure Planning",
        description: "Access expert advice on rotational grazing systems, water point placement, and fencing layouts to support livestock health and ensure long-term sustainability.",
        cta: "Book Consultation",
        whoIsItFor: "For livestock producers seeking to optimize their systems"
    },
    {
        title: "Training & Advisory Services",
        description: "Access on-site or remote training in grass identification, veld management, and ecological monitoring to build critical knowledge within your team or organization.",
        cta: "View Courses",
        whoIsItFor: "For teams, organizations, and individuals"
    }
];
  
export const seedCategories: SeedCategory[] = [
  {
    name: "Grasses",
    types: [
      "Perennial summer grasses",
      "Annual summer grasses",
      "Annual winter grasses",
      "Perennial winter grasses"
    ],
  },
  {
    name: "Legumes",
    types: [
      "Perennial summer legumes",
      "Annual summer legumes",
      "Annual winter legumes",
      "Perennial winter legumes"
    ],
  },
  {
    name: "Forage & Cover Crops",
    types: [
      "Root crops (Turnips, Rape, Radishes)",
      "Broadleaf crops (Chicory, Plantain, etc.)",
    ],
  },
];
  
