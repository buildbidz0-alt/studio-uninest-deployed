
'use client';

import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/marketplace/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ListFilter, Library, Utensils, Laptop, Bed, Book, Package, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Product } from '@/components/marketplace/product-card';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

// TODO: Fetch products from your API instead of using this mock data
const allProducts: Product[] = [];

const categories = [
  { name: 'Library Services', icon: Library, href: '/marketplace?category=Library+Services' },
  { name: 'Food Mess', icon: Utensils, href: '/marketplace?category=Food+Mess' },
  { name: 'Cyber Café', icon: Laptop, href: '/marketplace?category=Cyber+Café' },
  { name: 'Books', icon: Book, href: '/marketplace?category=Books' },
  { name: 'Hostels', icon: Bed, href: '/marketplace?category=Hostels' },
  { name: 'Other Products', icon: Package, href: '/marketplace?category=Other+Products' },
];

export default function MarketplaceContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');
  
  // In a real app, this filtering would be done by your backend API
  const filteredProducts = selectedCategory
    ? allProducts.filter(p => p.category === selectedCategory)
    : allProducts;

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Marketplace</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Buy, Sell & Support – by Students, for Students.
        </p>
      </section>

      <section>
         <h2 className="text-2xl font-bold tracking-tight mb-6">Categories</h2>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
                <Link href={category.href} key={category.name}>
                    <Card className="p-4 flex flex-col items-center justify-center aspect-square text-center transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:shadow-lg">
                        <category.icon className="size-8 mb-2"/>
                        <span className="font-semibold text-sm">{category.name}</span>
                    </Card>
                </Link>
            ))}
         </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold tracking-tight">{selectedCategory ? `${selectedCategory} Listings` : 'Featured Listings'}</h2>
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search listings..." className="pl-10 w-full md:w-64" />
                </div>
                <Button variant="outline" className="gap-2">
                    <ListFilter className="size-4" />
                    Filters
                </Button>
                {selectedCategory && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/marketplace">
                      <X className="size-4" />
                    </Link>
                  </Button>
                )}
                <Button disabled={!user}>+ Add Listing</Button>
            </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <h2 className="text-xl font-semibold">No listings found</h2>
            <p>{selectedCategory ? `There are no products in the "${selectedCategory}" category yet.` : 'No products have been listed on the marketplace yet.'} Check back later!</p>
          </div>
        )}
      </section>
    </div>
  );
}
