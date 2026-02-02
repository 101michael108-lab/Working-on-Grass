
export type Service = {
  title: string;
  description: string;
  cta: string;
  whoIsItFor: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string;
  imageHint?: string;
  sku?: string;
  brand?: string;
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

export type SiteImage = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type MediaLibraryItem = {
    id: string;
    name: string;
    imageUrl: string;
    description?: string;
    uploadedAt: any; // Firestore Timestamp
};
