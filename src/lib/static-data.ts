
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
