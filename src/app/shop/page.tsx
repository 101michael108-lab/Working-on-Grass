import ShopClient from '@/components/shop/ShopClient';
import { getProducts } from '@/lib/data';

export default async function ShopPage() {
  const products = await getProducts();
  
  return (
    <div className="container py-12 md:py-16">
       <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Products & Tools</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          A curated selection of tools, books, and seeds, field-tested and recommended by Working on Grass.
        </p>
      </div>
      <ShopClient products={products} />
    </div>
  );
}
