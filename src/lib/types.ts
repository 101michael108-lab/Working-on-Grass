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
