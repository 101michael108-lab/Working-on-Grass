
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import ShopSidebar from '@/components/shop/ShopSidebar';
import ProductGrid from '@/components/shop/ProductGrid';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function ShopClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Sync URL param to state
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam]);

  const allCategories = useMemo(() => {
    // Only physical products are sold in the shop.
    // Seed enquiries go to /seeds, courses are handled by ALUT separately.
    const order = ["Measurement & Tools", "Books & Field Guides"];
    const productCategories = [...new Set(products.map(p => p.category))];
    return order.filter(cat => productCategories.includes(cat));
  }, [products]);

  const maxPrice = useMemo(() => {
    const prices = products.map(p => p.price).filter(p => p > 0);
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
  }, [products]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);


  const { filteredProducts, totalFilteredProducts } = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      
      // In-depth inquiry products (old layout) don't have a direct buy price; all others do
      const isInquiryOnly = product.layout === 'in-depth' && !product.enabledSections;
      const matchesPrice = isInquiryOnly || product.price === 0 || (product.price >= priceRange[0] && product.price <= priceRange[1]);

      return matchesSearch && matchesCategory && matchesPrice;
    });

    return { filteredProducts: filtered, totalFilteredProducts: filtered.length };
  }, [searchTerm, selectedCategories, priceRange, products]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  return (
    <div className="grid lg:grid-cols-4 gap-8 xl:gap-12">
      <aside className="hidden lg:block lg:col-span-1">
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
        {/* Mobile category chips — visible only below lg breakpoint */}
        {allCategories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4 lg:hidden">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "text-sm px-3 py-1.5 rounded-full border font-medium transition-colors",
                  selectedCategories.includes(cat)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or type..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

         <div>
            {totalFilteredProducts > 0 ? (
                <ProductGrid products={filteredProducts} />
            ) : (
                <div className="text-center py-20">
                    <h3 className="text-xl font-semibold font-headline">No Products Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
