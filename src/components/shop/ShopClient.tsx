
"use client";

import React, { useState, useMemo } from 'react';
import ShopSidebar from '@/components/shop/ShopSidebar';
import ProductGrid from '@/components/shop/ProductGrid';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Product } from '@/lib/types';

export default function ShopClient({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const allCategories = useMemo(() => {
    // A specific order might be better than alphabetical for this store
    const order = ["Measurement & Tools", "Books & Field Guides", "Online Courses", "Seeds & Pasture Products"];
    const productCategories = [...new Set(products.map(p => p.category))];
    return order.filter(cat => productCategories.includes(cat));
  }, [products]);

  const maxPrice = useMemo(() => Math.ceil(Math.max(...products.map(p => p.price).filter(p => p > 0), 0)), [products]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);

  React.useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);


  const { productsByCategory, totalFilteredProducts } = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      
      const isForSale = product.layout === 'standard' || product.layout === 'book';
      // Only filter by price if the product is for sale and has a price.
      const matchesPrice = !isForSale || product.price === 0 || (product.price >= priceRange[0] && product.price <= priceRange[1]);

      return matchesSearch && matchesCategory && matchesPrice;
    });

    const productsByCategory = filtered.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    // Order the categories based on `allCategories`
    const orderedProductsByCategory: Record<string, Product[]> = {};
    for (const category of allCategories) {
        if (productsByCategory[category]) {
            orderedProductsByCategory[category] = productsByCategory[category];
        }
    }

    return { productsByCategory: orderedProductsByCategory, totalFilteredProducts: filtered.length };
  }, [searchTerm, selectedCategories, priceRange, products, allCategories]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  return (
    <div className="grid lg:grid-cols-4 gap-8 xl:gap-12">
      <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <ShopSidebar
                categories={allCategories}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                maxPrice={maxPrice}
            />
          </div>
      </aside>

      <main className="lg:col-span-3">
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

         <div className="space-y-16">
            {totalFilteredProducts > 0 ? (
                Object.entries(productsByCategory).map(([category, catProducts]) => {
                    if (catProducts.length === 0) return null;
                    return (
                        <section key={category}>
                            <h2 className="text-2xl font-bold tracking-tight mb-6 pb-2 border-b">{category}</h2>
                            <ProductGrid products={catProducts} />
                        </section>
                    );
                })
            ) : (
                <div className="text-center py-20">
                    <h3 className="text-xl font-semibold">No Products Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
