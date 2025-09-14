
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
  { name: 'Books', icon: Book },
  { name: 'Hostels', icon: Bed },
  { name: 'Food Mess', icon: Utensils },
  { name: 'Cyber Café', icon: Laptop },
  { name: 'Library', icon: Library },
  { name: 'Other Products', icon: Package },
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

        if (!response.ok) {
            const orderError = await response.json();
            throw new Error(orderError.error || 'Failed to create Razorpay order.');
        }
        
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
                setPurchasingProductId(null);
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
                router.push('/vendor/orders');
             }
          },
          modal: {
            ondismiss: () => setPurchasingProductId(null),
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
        setPurchasingProductId(null);
    }
  }, [user, supabase, toast, openCheckout, router]);

    const handleChat = useCallback(async (sellerId: string) => {
        if (!user || !supabase) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to chat.' });
            return;
        }
        if (user.id === sellerId) {
            toast({ variant: 'destructive', title: 'Error', description: 'You cannot start a chat with yourself.' });
            return;
        }

        try {
            // Step 1: Find if a private room with these two users already exists.
            const { data: existingRooms, error: existingRoomsError } = await supabase
                .rpc('get_mutual_private_room_id', {
                    user1_id: user.id,
                    user2_id: sellerId
                });

            if (existingRoomsError) throw existingRoomsError;

            if (existingRooms && existingRooms.length > 0 && existingRooms[0].room_id) {
                // A room already exists, navigate to chat.
                router.push('/chat');
                return;
            }

            // Step 2: If no room exists, create a new one.
            const { data: newRoom, error: newRoomError } = await supabase
                .from('chat_rooms')
                .insert({ is_private: true })
                .select('id')
                .single();
            
            if (newRoomError) throw newRoomError;

            // Step 3: Add both users as participants to the new room.
            const { error: participantsError } = await supabase
                .from('chat_room_participants')
                .insert([
                    { room_id: newRoom.id, user_id: user.id },
                    { room_id: newRoom.id, user_id: sellerId },
                ]);

            if (participantsError) throw participantsError;
            
            // Navigate to the chat page.
            router.push('/chat');

        } catch (error) {
            console.error('Error starting chat session:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not start chat session.' });
        }
    }, [user, supabase, toast, router]);
  
  const createCategoryLink = (categoryName: string) => {
    if (selectedCategory === categoryName) {
        return '/marketplace'; // Clicking again clears the filter
    }
    return `/marketplace?category=${encodeURIComponent(categoryName)}`;
  };

  return (
    <div className="space-y-8">
       {/* New Header Section */}
       <section className="bg-card p-6 rounded-2xl shadow-md border space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Marketplace</h1>
                    <p className="mt-1 text-muted-foreground">Buy, Sell & Support – by Students, for Students.</p>
                </div>
                {user && (
                    <Button asChild>
                        <Link href="/marketplace/new"><Plus className="mr-2"/> Create Listing</Link>
                    </Button>
                )}
            </div>
             <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full flex-grow">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search for textbooks, notes, bikes..." 
                        className="pl-11 h-12 text-base rounded-full" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2 h-12 rounded-full w-full sm:w-auto">
                    <ListFilter className="size-5" />
                    <span className="font-semibold">Filters</span>
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold mr-2">Categories:</span>
                {categories.map((category) => (
                     <Button
                        key={category.name}
                        asChild
                        variant={selectedCategory === category.name ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full gap-2"
                     >
                        <Link href={createCategoryLink(category.name)}>
                           <category.icon className="size-4" />
                           {category.name}
                           {selectedCategory === category.name && <X className="size-4 -mr-1" />}
                        </Link>
                    </Button>
                ))}
            </div>
       </section>
      
      {/* Listings Section */}
      <section>
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
