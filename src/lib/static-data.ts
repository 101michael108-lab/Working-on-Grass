
import type { Service, SeedCategory } from './types';

export const services: Service[] = [
    { 
        title: "Veld & Ecological Assessments", 
        description: "Comprehensive evaluation of veld condition, grazing capacity, and detailed vegetation surveys for farm planning, EIAs, or conservation compliance.",
        cta: "Request Assessment",
        whoIsItFor: "For Farmers, Reserves & EIAs"
    },
    {
        title: "Grazing & Restoration Planning",
        description: "Actionable plans to restore degraded grasslands and optimize grazing systems. We cover everything from rotational plans to water point and fencing layouts.",
        cta: "Create a Plan",
        whoIsItFor: "For Livestock Producers & Land Managers"
    },
    {
        title: "Mine & Industrial Rehabilitation",
        description: "Expert strategies to restore mined or degraded industrial land, helping you meet regulatory requirements, prevent soil erosion, and re-establish productive ecosystems.",
        cta: "Discuss a Project",
        whoIsItFor: "For Mining Houses & Industrial Sites"
    }
];

export const consultationServices: string[] = [
    "Veld condition and grazing capacity assessments",
    "Veld condition improvement and restoration recommendations",
    "Control of problem plants",
    "Grazing management infrastructure planning",
    "Grass species composition surveys",
    "Grass biomass evaluations",
    "Ecological management plans for game ranches",
    "Planted pasture recommendations",
    "Vegetation community/unit surveys and mapping",
    "Veld management plans (full document)",
    "Veld management related presentations during farmer's days",
    "Veld management training",
    "Identification of common grasses (checklists) on a property",
    "Veld condition and grazing capacity long-term monitoring",
    "Prescribed burning need evaluations",
    "Vegetation and ecological impact assessments (for EIA's)",
    "Agricultural potential assessments (for re-zoning and EIA's)",
    "Alien invasive vegetation assessments",
    "Erosion control/rehab recommendations (e.g. for gullies)",
    "Habitat assessments for rare game species",
    "Mine rehabilitation recommendations",
    "Rehabilitated mining sites monitoring",
    "Veld condition assessments for pre-purchase properties",
    "Wildfire impact (on grazing) assessments",
    "Elephant impact assessments"
];
  
export const seedCategories: SeedCategory[] = [
  {
    name: "Grasses",
    subCategories: [
      {
        name: "Perennial summer grass pastures",
        types: ["Smuts finger grass", "Eragrostis", "Rhodes grass", "Blue buffalo grass", "White buffalo grass", "Small buffalo grass", "Brachiaria’s (including hybrids)", "Wool grass", "Perennial signal grass"]
      },
      {
        name: "Annual summer grass pastures",
        types: ["Teff", "Fodder sorghums", "Babala", "Japanese millet"]
      },
      {
        name: "Annual winter grass pastures",
        types: ["Annual rye grass", "Forage oats", "Forage rye", "Forage barley", "Triticale"]
      },
      {
        name: "Perennial winter grass pastures",
        types: ["Perennial rye", "Tall fescues", "Cocksfoot", "Phalaris (perennial canary grass)"]
      }
    ]
  },
  {
    name: "Legumes",
    subCategories: [
      {
        name: "Perennial summer legumes",
        types: ["Poor man's lucerne", "Desmodiums", "Stylo"]
      },
      {
        name: "Annual summer legumes",
        types: ["Dolichos beans", "Cow peas", "Sunnhemp", "Red hemp", "Burgundy bean"]
      },
      {
        name: "Annual winter legumes",
        types: ["Annual clovers", "Annual medicago’s", "Serradella", "Lupins", "Vetch", "Fodder peas"]
      },
      {
        name: "Perennial winter legumes",
        types: ["Lucerne (all dormancy’s)", "Perennial clovers (white, red, strawberry)", "Birdsfoot trefoil"]
      }
    ]
  },
  {
    name: "Forage & Cover Crops",
    subCategories: [
      {
        name: "Root crops",
        types: ["Forage turnips", "Forage rape", "Radishes"]
      },
      {
        name: "Broadleaf crops",
        types: ["Chicory", "Plantain", "Buchweed", "Coriander", "Phacelia", "Flaxseed", "Sunflower"]
      }
    ]
  }
];
