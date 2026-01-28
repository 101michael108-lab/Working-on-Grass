
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from "@/components/ui/slider"


interface ShopSidebarProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceChange: (value: [number, number]) => void;
  maxPrice: number;
}

export default function ShopSidebar({ categories, selectedCategories, onCategoryChange, priceRange, onPriceChange, maxPrice }: ShopSidebarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => onCategoryChange(category)}
                />
                <Label htmlFor={category} className="font-normal cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div>
           <h3 className="font-semibold mb-3">Price Range</h3>
            <Slider
                defaultValue={[maxPrice]}
                max={maxPrice}
                step={10}
                onValueChange={(value) => onPriceChange([0, value[0]])}
                className="my-4"
            />
             <div className="flex justify-between text-sm text-muted-foreground">
                <span>R0</span>
                <span>R{priceRange[1]}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
