
export type Service = {
  title: string;
  description: string;
  cta: string;
  whoIsItFor: string;
};

export type Specification = {
  feature: string;
  description: string;
};

export type EnabledSections = {
  longDescription?: boolean;      // "About This Product" editorial body
  whatsInside?: boolean;          // Feature bullet list
  whoItsFor?: boolean;            // Target audience
  howItWorks?: boolean;           // Operational instructions
  fieldApplication?: boolean;     // Practical field use
  specifications?: boolean;       // Technical spec table
  expertRecommendation?: boolean; // Authority quote / blockquote
  valueProposition?: boolean;     // Callout banner
  calibrationNote?: boolean;      // Warning / calibration alert
};

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;      // Short description / tagline (shown in header)
  longDescription?: string; // Full editorial body text
  category: string;
  images?: string[];
  sku?: string;
  brand?: string;

  /** Which optional page sections are active. Replaces the old layout enum. */
  enabledSections?: EnabledSections;

  /** @deprecated Use enabledSections instead. Kept for backwards compatibility. */
  layout?: 'standard' | 'in-depth' | 'book';

  // Content fields — rendered when corresponding section is enabled
  valueProposition?: string;
  specifications?: Specification[];
  features?: string[];
  howItWorks?: string;
  fieldUse?: string;
  authorityStatement?: string;
  calibrationNote?: string;
  targetAudience?: string;
};


export type CartItem = {
  product: Product;
  quantity: number;
};

export type SeedCategory = {
  name: string;
  subCategories: {
    name: string;
    types: string[];
  }[];
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  userId: string;
  orderDate: any; // Firestore Timestamp
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Fulfilled' | 'Delivered' | 'Cancelled';
  shippingInfo: any;
  items: OrderItem[];
};

export type User = {
    id: string;
    email: string;
    displayName: string;
    role: 'user' | 'admin';
    createdAt: any; // Firestore timestamp
    updatedAt: any; // Firestore timestamp
};

export type Inquiry = {
    id: string;
    name: string;
    email?: string;
    contactDetail?: string;
    phone?: string;
    location?: string;
    serviceInterestedIn?: string;
    service?: string;
    message?: string;
    needs?: string;
    submissionDate: any; // Firestore Timestamp
    type: 'contact' | 'consultation';
};

export type SiteImage = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type MediaLibraryItem = {
    id:string;
    name: string;
    imageUrl: string;
    description?: string;
    uploadedAt: any; // Firestore Timestamp
};

export type SiteSettings = {
  storeName: string;
  contactEmail: string;
  senderEmail?: string;
  shippingFee: number;
  payfastMerchantId: string;
  payfastMerchantKey: string;
  isLiveMode: boolean;
};
