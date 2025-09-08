import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  aiHint: string;
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        <div className="aspect-w-4 aspect-h-3">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={300}
            data-ai-hint={product.aiHint}
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold truncate">{product.name}</h3>
          <p className="text-lg font-bold text-primary">₹{product.price.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">Buy Now</Button>
      </CardFooter>
    </Card>
  );
}
