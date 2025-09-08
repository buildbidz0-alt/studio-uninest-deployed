
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';

export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  aiHint: string;
  category: string;
  seller: string;
  description: string;
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();

  return (
    <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-lg flex flex-col">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            data-ai-hint={product.aiHint}
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Badge variant="secondary" className="mb-2">{product.category}</Badge>
        <CardTitle className="text-lg font-semibold leading-snug mb-2 h-12 overflow-hidden">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground mb-4 h-10 overflow-hidden">{product.description}</p>
        <p className="text-sm">Sold by <span className="font-medium text-primary">{product.seller}</span></p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <div className="flex items-center justify-between w-full">
            <p className="text-xl font-bold text-primary">₹{product.price.toLocaleString()}</p>
            <Button disabled={!user}>Buy Now</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
