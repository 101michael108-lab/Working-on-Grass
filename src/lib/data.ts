import type { Service, SeedCategory, Product } from './types';
import { PlaceHolderImages } from './placeholder-images';

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
  
export const products: Product[] = [
  // Tools
  {
    id: 'dpm-001',
    name: 'Disc Pasture Meter (DPM)',
    price: 3450.00,
    description: 'An aluminium instrument used to accurately estimate grass biomass per hectare (kg dry grass/ha) in veld. A reliable alternative to cutting, drying, and weighing samples.',
    category: 'Measurement & Tools',
    image: PlaceHolderImages.find(p => p.id === 'dpm-product-image')?.imageUrl || `https://picsum.photos/seed/dpm-001/300/300`,
    imageHint: "metal instrument",
    sku: 'DPM-001',
    brand: 'Working on Grass'
  },
  // Books
  {
    id: 'book-gtgsa-en',
    name: 'Guide to Grasses of Southern Africa',
    price: 450.00,
    description: 'The ultimate photographic guide to 320 common and important grasses in southern Africa. Includes an easy-to-use identification key and over 1,000 colour photos.',
    category: 'Books & Field Guides',
    image: PlaceHolderImages.find(p => p.id === 'book-guide')?.imageUrl || `https://picsum.photos/seed/book-gtgsa-en/300/300`,
    imageHint: "book cover",
    sku: 'BRIZA-978-1-920217-35-8',
    brand: 'Briza Publications'
  },
  {
    id: 'book-vmp-en',
    name: 'Veld Management: Principles and Practices',
    price: 420.00,
    description: 'This book simplifies a technical subject with over 380 photos and illustrations, covering the natural resources and ecological principles needed for good veld management.',
    category: 'Books & Field Guides',
    image: PlaceHolderImages.find(p => p.id === 'book-vmp-en')?.imageUrl || `https://picsum.photos/seed/book-vmp-en/300/300`,
    imageHint: "book veld",
    sku: 'BRIZA-978-1-920217-79-2',
    brand: 'Briza Publications'
  },
  // Courses
  {
    id: 'course-grass-id',
    name: 'Online Grass Identification Course',
    price: 1500.00,
    description: 'A self-paced online course designed to teach you how to identify common grasses of Southern Africa. Taught by expert Frits van Oudtshoorn.',
    category: 'Online Courses',
    image: PlaceHolderImages.find(p => p.id === 'course-grass-id')?.imageUrl || `https://picsum.photos/seed/course-grass-id/400/225`,
    imageHint: 'online course',
    sku: 'WOG-C01',
    brand: 'Working on Grass'
  },
  {
    id: 'course-veld-management',
    name: 'Veld Management for Professionals',
    price: 2250.00,
    description: 'An advanced course on sustainable veld management, covering grazing capacity, ecological planning, and restoration techniques for land managers.',
    category: 'Online Courses',
    image: PlaceHolderImages.find(p => p.id === 'course-veld-management')?.imageUrl || `https://picsum.photos/seed/course-veld-management/400/225`,
    imageHint: 'veld management',
    sku: 'WOG-C02',
    brand: 'Working on Grass'
  },
  // Seeds
  {
    id: 'seed-smuts-finger',
    name: 'Smuts Finger Grass Seed (1kg)',
    price: 180.00,
    description: 'A perennial summer grass ideal for grazing and hay production. Well-adapted to various soil types.',
    category: 'Seeds & Pasture Products',
    image: PlaceHolderImages.find(p => p.id === 'seed-smuts-finger')?.imageUrl || `https://picsum.photos/seed/seed-smuts-finger/300/300`,
    imageHint: "grass seeds",
    sku: 'SEED-SFG-1KG',
    brand: 'Barenbrug SA'
  },
  {
    id: 'seed-rhodes-grass',
    name: 'Rhodes Grass Seed (1kg)',
    price: 220.00,
    description: 'A fast-growing perennial summer grass, excellent for pasture establishment and erosion control.',
    category: 'Seeds & Pasture Products',
    image: PlaceHolderImages.find(p => p.id === 'seed-rhodes-grass')?.imageUrl || `https://picsum.photos/seed/seed-rhodes-grass/300/300`,
    imageHint: "seed packet",
    sku: 'SEED-RRG-1KG',
    brand: 'Barenbrug SA'
  },
  {
    id: 'seed-blue-buffalo',
    name: 'Blue Buffalo Grass Seed (1kg)',
    price: 250.00,
    description: 'A drought-tolerant perennial grass, highly palatable and suitable for grazing in arid and semi-arid regions.',
    category: 'Seeds & Pasture Products',
    image: PlaceHolderImages.find(p => p.id === 'seed-blue-buffalo')?.imageUrl || `https://picsum.photos/seed/seed-blue-buffalo/300/300`,
    imageHint: "dry grass seed",
    sku: 'SEED-BBG-1KG',
    brand: 'Barenbrug SA'
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find(p => p.id === id);
}
