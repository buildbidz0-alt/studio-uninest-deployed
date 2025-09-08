import ProductCard from '@/components/marketplace/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ListFilter } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace | Uninest',
  description: 'Buy and sell textbooks and other second-hand goods.',
};

const products = [
  {
    id: 1,
    name: 'Advanced Engineering Mathematics',
    price: 89.99,
    imageUrl: 'https://picsum.photos/seed/p1/400/300',
    aiHint: 'textbook cover'
  },
  {
    id: 2,
    name: 'Organic Chemistry, 8th Edition',
    price: 120.50,
    imageUrl: 'https://picsum.photos/seed/p2/400/300',
    aiHint: 'science book'
  },
  {
    id: 3,
    name: 'The Art of Computer Programming',
    price: 75.00,
    imageUrl: 'https://picsum.photos/seed/p3/400/300',
    aiHint: 'coding textbook'
  },
  {
    id: 4,
    name: 'Principles of Economics',
    price: 45.99,
    imageUrl: 'https://picsum.photos/seed/p4/400/300',
    aiHint: 'economics book'
  },
  {
    id: 5,
    name: 'Graphic Design School: The Principles',
    price: 35.00,
    imageUrl: 'https://picsum.photos/seed/p5/400/300',
    aiHint: 'design book'
  },
  {
    id: 6,
    name: 'Used Scientific Calculator',
    price: 25.00,
    imageUrl: 'https://picsum.photos/seed/p6/400/300',
    aiHint: 'calculator device'
  },
    {
    id: 7,
    name: 'Lab Coat (Medium)',
    price: 15.00,
    imageUrl: 'https://picsum.photos/seed/p7/400/300',
    aiHint: 'lab coat'
  },
  {
    id: 8,
    name: 'Complete Set of Highlighters',
    price: 8.99,
    imageUrl: 'https://picsum.photos/seed/p8/400/300',
    aiHint: 'stationery items'
  },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Textbook Marketplace</h1>
        <p className="text-muted-foreground">Find great deals on textbooks and other student essentials.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search for textbooks, notes, and more..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <ListFilter className="size-4" />
          Filters
        </Button>
         <Button>Add Listing</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
