
"use client";

import React, { useState, useMemo } from 'react';
import { products } from '@/lib/data';
import ShopSidebar from '@/components/shop/ShopSidebar';
import ProductGrid from '@/components/shop/ProductGrid';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const allCategories = [...new Set(products.map(p => p.category))];

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const maxPrice = useMemo(() => Math.ceil(Math.max(...products.map(p => p.price), 0)), []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);


  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchTerm, selectedCategories, priceRange]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  return (
    <div className="container py-12 md:py-16">
       <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Shop</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Browse our curated selection of professional tools, guides, and seeds.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
           <ShopSidebar
            categories={allCategories}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            maxPrice={maxPrice}
          />
        </aside>

        <main className="md:col-span-3">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <ProductGrid products={filteredProducts} />
        </main>
      </div>
    </div>
  );
}
