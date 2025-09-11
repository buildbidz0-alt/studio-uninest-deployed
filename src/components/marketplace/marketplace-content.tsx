'use client';

import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/marketplace/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ListFilter, Library, Utensils, Laptop, Bed, Book, Package, X, Loader2, Plus, MessageSquare, Armchair } from 'lucide-react';
import type { Product } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useRouter } from 'next/navigation';

const categories = [
  { name: 'Library Booking', icon: Armchair, href: '/booking', color: 'from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50' },
  { name: 'Food Mess', icon: Utensils, href: '/marketplace?category=Food+Mess', color: 'from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50' },
  { name: 'Cyber Café', icon: Laptop, href: '/marketplace?category=Cyber+Café', color: 'from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50' },
  { name: 'Books', icon: Book, href: '/marketplace?category=Books', color: 'from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50' },
  { name: 'Hostels', icon: Bed, href: '/marketplace?category=Hostels', color: 'from-rose-100 to-rose-200 dark:from-rose-900/50 dark:to-rose-800/50' },
  { name: 'Other Products', icon: Package, href: '/marketplace?category=Other+Products', color: 'from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-600/50' },
];

export default function MarketplaceContent() {
  const { user, supabase } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { openCheckout, isLoaded } = useRazorpay();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasingProductId, setPurchasingProductId] = useState<number | null>(null);
  
  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!supabase) return;
      setLoading(true);
      let query = supabase
        .from('products')
        .select(`
          *,
          profiles:seller_id (
            full_name
          )
        `);

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch product listings.',
        });
      } else {
        const mappedData = data.map(p => ({
          ...p,
          seller: p.profiles
        }));
        setProducts(mappedData as Product[]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [selectedCategory, supabase, toast]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleBuyNow = useCallback(async (product: Product) => {
    if (!user || !supabase) {
        toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to purchase items.' });
        return;
    }
    setPurchasingProductId(product.id);

    try {
        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: product.price * 100, currency: 'INR' }),
        });

        if (!response.ok) throw new Error('Failed to create Razorpay order.');
        
        const order = await response.json();

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: `Purchase: ${product.name}`,
          description: `Order from vendor: ${product.seller.full_name}`,
          order_id: order.id,
          handler: async function (response: any) {
            const { data: newOrder, error: orderError } = await supabase
              .from('orders')
              .insert({
                buyer_id: user.id,
                vendor_id: product.seller_id,
                total_amount: product.price,
                razorpay_payment_id: response.razorpay_payment_id,
              })
              .select('id')
              .single();

            if (orderError || !newOrder) {
                toast({ variant: 'destructive', title: 'Error Saving Order', description: 'Payment received, but failed to save your order. Please contact support.' });
                return;
            }

            const { error: itemError } = await supabase
              .from('order_items')
              .insert({
                order_id: newOrder.id,
                product_id: product.id,
                quantity: 1, // Assuming quantity is always 1 for now
                price: product.price,
              });

             if (itemError) {
                toast({ variant: 'destructive', title: 'Error Saving Order Item', description: 'Your order was processed but had an issue. Please contact support.' });
             } else {
                toast({ title: 'Payment Successful!', description: `${product.name} has been purchased.` });
             }
          },
          prefill: {
            name: user.user_metadata?.full_name || '',
            email: user.email || '',
          },
          notes: {
            type: 'product_purchase',
            productId: product.id,
            userId: user.id,
          },
          theme: {
            color: '#1B365D',
          },
        };
        openCheckout(options);
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Purchase Failed',
            description: error instanceof Error ? error.message : 'Could not connect to the payment gateway.',
        });
    } finally {
        setPurchasingProductId(null);
    }
  }, [user, supabase, toast, openCheckout]);

  const handleChat = useCallback(async (sellerId: string) => {
    if (!user || !supabase) {
        toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to chat.' });
        return;
    }
    
    // Check if a chat room already exists
    const { data: existingRoom, error: fetchError } = await supabase.rpc('get_or_create_chat_room', {
        p_user_id1: user.id,
        p_user_id2: sellerId
    });

    if (fetchError || !existingRoom) {
        console.error('Error getting or creating chat room:', fetchError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start chat session.' });
        return;
    }
    
    router.push('/chat');

  }, [user, supabase, toast, router]);

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Marketplace</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Buy, Sell & Support – by Students, for Students.
        </p>
      </section>

      {user && (
        <Link href="/marketplace/new">
          <Button className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-40 h-16 w-16 rounded-full shadow-lg">
            <Plus className="h-8 w-8" />
          </Button>
        </Link>
      )}


      <section>
         <h2 className="text-2xl font-bold tracking-tight mb-6">Categories</h2>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((category) => (
                <Link href={category.href} key={category.name}>
                    <div className={cn(
                      "group relative flex flex-col items-center justify-center p-2 h-24 rounded-2xl border text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br",
                      category.color,
                      selectedCategory === category.name ? "ring-2 ring-primary ring-offset-2" : "border-transparent"
                    )}>
                        <category.icon className="size-6 mb-1.5 text-primary/80 transition-transform group-hover:scale-110"/>
                        <span className="font-bold font-headline text-sm text-primary/90">{category.name}</span>
                    </div>
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
                    <Input 
                      placeholder="Search listings..." 
                      className="pl-10 w-full md:w-64" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
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
            </div>
        </div>
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                user={user}
                onBuyNow={handleBuyNow}
                onChat={handleChat}
                isBuying={purchasingProductId === product.id}
                isRazorpayLoaded={isLoaded}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16 bg-card rounded-2xl">
            <h2 className="text-xl font-semibold">No listings found</h2>
            <p>{selectedCategory ? `There are no products in the "${selectedCategory}" category yet.` : 'No products have been listed on the marketplace yet.'} Check back later!</p>
          </div>
        )}
      </section>
    </div>
  );
}
