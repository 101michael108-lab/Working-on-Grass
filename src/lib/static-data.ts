
import type { Service, SeedCategory } from './types';

export const services: Service[] = [
    {
        title: "Property Assessments",
        description: "Comprehensive evaluations of veld condition, grazing capacity, and vegetation classification, including mapping, long-term monitoring, agricultural potential assessments, and specialised habitat evaluations for rare game species.",
        cta: "Request Assessment",
        whoIsItFor: ""
    },
    {
        title: "Veld Management Advice",
        description: "Practical, science-based guidance on improving and restoring veld condition, including grazing management, control of problem plants, prescribed burning, and erosion control.",
        cta: "Discuss Your Veld",
        whoIsItFor: ""
    },
    {
        title: "Planted Pastures and Forages",
        description: "Recommendations on suitable forage and cover crops tailored to your specific needs and environmental conditions, drawing on extensive experience and a wide network of experts.",
        cta: "Get Recommendations",
        whoIsItFor: ""
    },
    {
        title: "Training & Presentations",
        description: "Short courses and training on grass identification and veld management, as well as presentations at farmers' days and industry events.",
        cta: "Enquire",
        whoIsItFor: ""
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
