import type { Service, SeedCategory } from './types';

export const services: Service[] = [
    { 
        title: "Veld Condition & Grazing Capacity Assessments", 
        description: "We evaluate the health of your veld, measure its productivity, and estimate sustainable grazing limits to prevent overgrazing and protect long-term productivity.",
        cta: "Request Assessment"
    },
    {
        title: "Grassland & Veld Restoration Planning",
        description: "Our team designs practical, actionable plans to restore degraded grasslands or pastures, which enhances biodiversity, improves soil health, and increases livestock yield.",
        cta: "Discuss a Plan"
    },
    {
        title: "Ecological & Vegetation Surveys",
        description: "We provide detailed mapping and analysis of flora on your land. These surveys are often a prerequisite for Environmental Impact Assessments (EIAs), farm planning, or conservation compliance.",
        cta: "Request a Survey"
    },
    {
        title: "Mine Site Rehabilitation & Land Management",
        description: "We create and implement strategies to restore mined or degraded industrial sites to productive or natural states, helping you meet regulatory requirements and prevent soil erosion.",
        cta: "Contact Us"
    },
    {
        title: "Grazing Management & Infrastructure Planning",
        description: "Receive expert advice on rotational grazing systems, water point placement, and fencing layouts to improve livestock health, yield, and ensure long-term sustainability.",
        cta: "Book Consultation"
    },
    {
        title: "Training & Advisory Services",
        description: "Benefit from on-site or remote training in grass identification, veld management, and ecological monitoring to build critical knowledge within your team or organization.",
        cta: "View Courses"
    }
];
  
  export const seedCategories: SeedCategory[] = [
    {
      name: "Grasses",
      types: [
        "Perennial summer grass pastures: Smuts finger grass, Eragrostis, Rhodes grass, Blue buffalo grass, White buffalo grass, Small buffalo grass, Brachiaria’s (including hybrids), Wool grass and Perennial signal grass.",
        "Annual summer grass pastures: Teff, Fodder sorghums, Babala, and Japanese millet.",
        "Annual winter grass pastures: Annual rye grass, Forage oats, Forage rye, Forage barley, Triticale.",
        "Perennial winter grass pastures: Perennial rye, Tall fescues, Cocksfoot, Phalaris (perennial canary grass)."
      ],
    },
    {
      name: "Legumes",
      types: [
        "Perennial summer legumes: Poor man’s lucerne and Desmodiums, Stylo.",
        "Annual summer legumes: Dolichos beans, Cow peas, Sunnhemp, Red hemp, Burgundy bean.",
        "Annual winter legumes: Annual clovers, Annual medicago’s, Serradella, Lupins, Vetch, Fodder peas.",
        "Perennial winter legumes: Lucerne (all dormancy’s), Perennial clovers (white, red, strawberry), Birdsfoot trefoil."
      ],
    },
    {
      name: "Other",
      types: [
        "Root crops: Forage turnips, Forage rape, Radishes.",
        "Broadleaf crops: Chicory, Plantain, Buchweed, Coriander, Phacelia, Flaxseed, Sunflower."
      ],
    },
  ];
  
