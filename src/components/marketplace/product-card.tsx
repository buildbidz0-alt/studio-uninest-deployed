
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

type ProductCardProps = {
  product: Product;
  user: User | null;
  onBuyNow: (product: Product) => void;
  onChat: (sellerId: string) => void;
  isBuying: boolean;
  isRazorpayLoaded: boolean;
};

export default function ProductCard({ product, user, onBuyNow, onChat, isBuying, isRazorpayLoaded }: ProductCardProps) {
  const sellerName = typeof product.seller === 'object' && product.seller !== null 
    ? product.seller.full_name 
    : 'Anonymous';
  
  const canContact = user && user.id !== product.seller_id;
  const isLibrary = product.category === 'Library';
  const isHostel = product.category === 'Hostels';
  const isPhysicalProduct = ['Books', 'Other Products'].includes(product.category);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    action();
  }

  const getCardLink = () => {
    if (isLibrary) return `/marketplace/library/${product.id}`;
    if (isHostel) return `/hostels/${product.id}`;
    return `/marketplace/${product.id}`;
  }

  return (
    <Link href={getCardLink()} className="flex flex-col h-full group">
        <Card className="overflow-hidden shadow-sm transition-shadow group-hover:shadow-lg flex flex-col flex-grow">
        <CardHeader className="p-0">
            <div className="relative aspect-[16/9]">
            <Image
                src={product.image_url || 'https://picsum.photos/seed/product/400/225'}
                alt={product.name}
                fill
                data-ai-hint="product image"
                className="object-cover transition-transform group-hover:scale-105"
            />
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
            <Badge variant="secondary" className="mb-2 capitalize">{product.category}</Badge>
            <CardTitle className="text-lg font-semibold leading-snug mb-2 h-12 overflow-hidden group-hover:text-primary transition-colors">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground mb-4 h-10 overflow-hidden text-ellipsis">{product.description}</p>
            <p className="text-sm">Sold by <span className="font-medium text-primary">{sellerName}</span></p>
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
            <div className="flex items-center justify-between w-full gap-2">
                <p className="text-xl font-bold text-primary">
                    {isLibrary ? `₹${product.price.toLocaleString()}/seat` : isHostel ? 'View Details' : `₹${product.price.toLocaleString()}`}
                </p>
                <div className='flex gap-2'>
                {canContact && isPhysicalProduct ? (
                    <Button onClick={(e) => handleButtonClick(e, () => onChat(product.seller_id))}>
                        <MessageSquare className="mr-2 size-4"/>
                        Contact Seller
                    </Button>
                ) : canContact ? (
                     <Button variant="outline" size="icon" onClick={(e) => handleButtonClick(e, () => onChat(product.seller_id))}>
                        <MessageSquare className="size-4"/>
                        <span className="sr-only">Chat with seller</span>
                    </Button>
                ) : null }
                
                {isLibrary || isHostel ? (
                    <Button>{isHostel ? 'View Rooms' : 'Book Seat'}</Button>
                ) : !isPhysicalProduct ? (
                    <Button onClick={(e) => handleButtonClick(e, () => onBuyNow(product))} disabled={!canContact || !isRazorpayLoaded || isBuying}>
                        {isBuying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Buy Now
                    </Button>
                ) : null}
                </div>
            </div>
        </CardFooter>
        </Card>
    </Link>
  );
}
