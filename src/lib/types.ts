export type Service = {
  title: string;
  description: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  imageHint: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type SeedCategory = {
  name: string;
  types: string[];
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
