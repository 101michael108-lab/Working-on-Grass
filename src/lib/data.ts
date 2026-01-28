import type { Product } from './types';
import { firestore } from '@/firebase/server-init';

export async function getProducts(): Promise<Product[]> {
    const snapshot = await firestore.collection('products').orderBy('name').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            price: data.price,
            description: data.description,
            category: data.category,
            image: data.image,
            imageHint: data.imageHint,
            sku: data.sku,
            brand: data.brand,
        };
    });
}
  
export async function getProduct(id: string): Promise<Product | undefined> {
  const docSnap = await firestore.collection('products').doc(id).get();
  if (!docSnap.exists) {
    return undefined;
  }
  const data = docSnap.data()!;
  return {
    id: docSnap.id,
    name: data.name,
    price: data.price,
    description: data.description,
    category: data.category,
    image: data.image,
    imageHint: data.imageHint,
    sku: data.sku,
    brand: data.brand,
  } as Product;
}
