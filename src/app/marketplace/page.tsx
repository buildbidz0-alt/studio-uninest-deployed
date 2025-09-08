
import ProductCard from '@/components/marketplace/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ListFilter } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace | Uninest',
  description: 'Buy and sell textbooks and other second-hand goods.',
};

const products: any[] = [];

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

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <h2 className="text-xl font-semibold">Marketplace is empty</h2>
          <p>Check back later or be the first to add a listing!</p>
        </div>
      )}
    </div>
  );
}
