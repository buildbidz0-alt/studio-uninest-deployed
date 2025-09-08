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

const allProducts: Product[] = [
  {
    id: 1,
    name: 'Introduction to Algorithms, 3rd Edition',
    price: 4500,
    imageUrl: 'https://picsum.photos/seed/book1/400/300',
    category: 'Books',
    seller: 'Priya S.',
    description: 'The "Bible" of algorithms. A must-have for any serious CS student. Great condition.',
    aiHint: 'textbook cover',
  },
  {
    id: 2,
    name: 'Noise-Cancelling Headphones',
    price: 8000,
    imageUrl: 'https://picsum.photos/seed/gadget1/400/300',
    category: 'Other Products',
    seller: 'David C.',
    description: 'Perfect for studying in noisy environments. Comes with the original case.',
    aiHint: 'headphones product',
  },
  {
    id: 3,
    name: 'Mini Fridge for Hostel Room',
    price: 5500,
    imageUrl: 'https://picsum.photos/seed/other1/400/300',
    category: 'Hostels',
    seller: 'Aisha M.',
    description: 'Compact and efficient. Barely used for one semester.',
    aiHint: 'mini fridge',
  },
  {
    id: 4,
    name: 'Organic Chemistry Notes',
    price: 999,
    imageUrl: 'https://picsum.photos/seed/notes1/400/300',
    category: 'Books',
    seller: 'Priya S.',
    description: 'Complete, handwritten notes for the entire semester. Includes diagrams and key reaction mechanisms.',
    aiHint: 'notebook pages',
  },
];

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

      {/* Category Grid */}
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


      {/* Featured Listings */}
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
            <p>There are no products in the "{selectedCategory}" category yet. Check back later!</p>
          </div>
        )}
      </section>
    </div>
  );
}
