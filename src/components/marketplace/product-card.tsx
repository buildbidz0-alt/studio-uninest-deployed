
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/types';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  // TODO: Replace this with actual logic based on user's purchase history from your backend
  const hasPurchased = false; 

  const sellerName = typeof product.seller === 'object' && product.seller !== null 
    ? product.seller.full_name 
    : 'Anonymous';

  return (
    <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-lg flex flex-col">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={product.image_url || 'https://picsum.photos/seed/product/400/225'}
            alt={product.name}
            fill
            data-ai-hint="product image"
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Badge variant="secondary" className="mb-2">{product.category}</Badge>
        <CardTitle className="text-lg font-semibold leading-snug mb-2 h-12 overflow-hidden">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground mb-4 h-10 overflow-hidden">{product.description}</p>
        <p className="text-sm">Sold by <span className="font-medium text-primary">{sellerName}</span></p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <div className="flex items-center justify-between w-full gap-2">
            <p className="text-xl font-bold text-primary">₹{product.price.toLocaleString()}</p>
            <div className='flex gap-2'>
              {user && user.id !== product.seller_id && (
                  <Button variant="outline" size="sm" asChild>
                    {/* TODO: This should link to the specific chat room with the vendor */}
                    <Link href="/chat">
                      <MessageSquare className="size-4 mr-2"/>
                      Chat
                    </Link>
                  </Button>
              )}
              <Button disabled={!user || user.id === product.seller_id}>Buy Now</Button>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
