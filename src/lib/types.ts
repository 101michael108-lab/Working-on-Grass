
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
  /** When set, overrides the store-wide shipping fee from Settings for this product. */
  shippingFee?: number;
  /** Digital product (e.g. PDF, online course) — never charged shipping. */
  isDigital?: boolean;
  description: string;      // Short description / tagline (shown in header)
  longDescription?: string; // Full editorial body text
  category: string;
  images?: string[];
  sku?: string;
  brand?: string;

  /** Optional PDF guide emailed to the customer when this product is purchased. */
  guideUrl?: string;
  /** Display filename for the attached guide (e.g. "Grazing-Guide.pdf"). */
  guideName?: string;

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
  /** Sequential, human-friendly number shown to customers (e.g. 1001). */
  orderNumber?: number;
  userId: string;
  orderDate: any; // Firestore Timestamp
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Fulfilled' | 'Delivered' | 'Cancelled';
  /** Shipping charged for this order (after product overrides). */
  shippingFee?: number;
  shippingInfo: any;
  /** Separate billing address, present only when it differs from shipping. */
  billingInfo?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
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

export type FieldNote = {
  id: string;
  /** URL slug, e.g. "how-to-calculate-grazing-capacity". */
  slug: string;
  title: string;
  /** Short summary / standfirst shown under the title and in cards + meta description. */
  deck: string;
  category: string;
  /** Optional feature image URL (media library or any https URL). */
  coverImageUrl?: string;
  /** Bulleted "Key takeaways" shown near the top of the article. */
  takeaways?: string[];
  /** Article body in markdown-lite: ## headings, paragraphs, - bullets, > quote, **bold**, [text](/url). */
  body: string;
  /** Optional pull quote. */
  pullQuote?: string;
  /** Optional product id to surface as "Referenced in this article". */
  relatedProductId?: string;
  /** Optional explicit reading time; computed from body when omitted. */
  readMinutes?: number;
  isPublished: boolean;
  publishedAt: any; // Firestore Timestamp
  updatedAt?: any;
};

export type Resource = {
  id: string;
  title: string;
  description: string;
  resourceType: 'PDF' | 'Video' | 'Article' | 'Template' | 'Guide' | 'Map' | 'Checklist';
  fileUrl: string;
  relatedHref?: string;
  relatedLabel?: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: any;
};

export type SiteSettings = {
  storeName: string;
  contactEmail: string;
  senderEmail?: string;
  /** VAT registration number — when set, invoices render as a compliant TAX INVOICE. */
  vatNumber?: string;
  shippingFee: number;
  payfastMerchantId: string;
  payfastMerchantKey: string;
  isLiveMode: boolean;
};
