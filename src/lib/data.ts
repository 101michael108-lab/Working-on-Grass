import type { Service, SeedCategory } from './types';

export const services: Service[] = [
    { title: "Veld condition and grazing capacity assessments", description: "In-depth analysis of your veld's health and ability to sustain livestock or game." },
    { title: "Veld condition improvement and restoration recommendations", description: "Actionable plans to enhance the health and productivity of your veld." },
    { title: "Control of problem plants", description: "Strategies for managing and eradicating invasive or undesirable plant species." },
    { title: "Grazing management infrastructure planning", description: "Design and layout of fences, water points, and other infrastructure for optimal grazing rotation." },
    { title: "Grass species composition surveys", description: "Detailed surveys to identify the mix of grass species on your property." },
    { title: "Grass biomass evaluations", description: "Measuring the amount of available forage to inform stocking rates and grazing plans." },
    { title: "Ecological management plans for game ranches", description: "Comprehensive plans for managing wildlife and their habitats sustainably." },
    { title: "Planted pasture recommendations", description: "Advice on selecting and establishing suitable pasture species for your needs." },
    { title: "Vegetation community/unit surveys and mapping", description: "Mapping different vegetation zones on your property for targeted management." },
    { title: "Veld management plans (full document)", description: "A complete, documented strategy for the long-term management of your veld." },
    { title: "Veld management related presentations during farmer’s days", description: "Educational talks and presentations to share knowledge with the farming community." },
    { title: "Veld management training", description: "Hands-on training courses for farmers, managers, and students." },
    { title: "Identification of common grasses (checklists) on a property", description: "Providing checklists and assistance in identifying key grass species." },
    { title: "Veld condition and grazing capacity long-term monitoring", description: "Setting up and conducting long-term monitoring programs to track changes over time." },
    { title: "Prescribed burning need evaluations", description: "Assessing whether prescribed fire is a suitable tool for your veld management goals." },
    { title: "Vegetation and ecological impact assessments (for EIA’s)", description: "Expert assessments for Environmental Impact Assessment processes." },
    { title: "Agricultural potential assessments (for re-zoning and EIA’s)", description: "Evaluating land for its agricultural potential as part of legal and environmental processes." },
    { title: "Alien invasive vegetation assessments", description: "Identifying and quantifying the extent of alien invasive plants." },
    { title: "Erosion control/rehab recommendations (e.g. for gullies)", description: "Practical solutions for preventing and rehabilitating soil erosion." },
    { title: "Habitat assessments for rare game species", description: "Evaluating habitats for the introduction or conservation of rare wildlife." },
    { title: "Mine rehabilitation recommendations", description: "Expert guidance on restoring ecosystems on post-mining landscapes." },
    { title: "Rehabilitated mining sites monitoring", description: "Monitoring the ecological recovery of rehabilitated mining areas." },
    { title: "Veld condition assessments for pre-purchase properties", description: "Due diligence assessments of veld condition before you buy a property." },
    { title: "Wildfire impact (on grazing) assessments", description: "Assessing the effect of wildfires on grazing resources and planning recovery." },
    { title: "Elephant impact assessments", description: "Evaluating the impact of elephant populations on vegetation and ecosystems." },
  ];
  
  export const seedCategories: SeedCategory[] = [
    {
      name: "Grasses",
      types: [
        "Perennial summer grass pastures – Smuts finger grass, Eragrostis, Rhodes grass, Blue buffalo grass, White buffalo grass, Small buffalo grass, Brachiaria’s (including hybrids), Wool grass and Perennial signal grass.",
        "Annual summer grass pastures – Teff, Fodder sorghums, Babala, and Japanese millet.",
        "Annual winter grass pastures – Annual rye grass, Forage oats, Forage rye, Forage barley, Triticale",
        "Perennial winter grass pastures – Perennial rye, Tall fescues, Cocksfoot, Phalaris (perennial canary grass)",
      ],
    },
    {
      name: "Legumes",
      types: [
        "Perennial summer legumes – Poor man’s lucerne and Desmodiums, Stylo",
        "Annual summer legumes – Dolichos beans, Cow peas, Sunnhemp, Red hemp, Burgundy bean",
        "Annual winter legumes – Annual clovers, Annual medicago’s, Serradella, Lupins, Vetch, Fodder peas",
        "Perennial winter legumes – Lucerne (all dormancy’s), Perennial clovers (white, red, strawberry), Birdsfoot trefoil",
      ],
    },
    {
      name: "Other",
      types: [
        "Root crops – Forage turnips, Forage rape, Radishes",
        "Broadleaf crops – Chicory, Plantain, Buchweed, Coriander, Phacelia, Flaxseed, Sunflower",
      ],
    },
  ];
  