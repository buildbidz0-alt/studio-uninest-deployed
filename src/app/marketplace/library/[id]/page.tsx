
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import LibraryDetailClient from '@/components/marketplace/library-detail-client';
import type { Product } from '@/lib/types';

type LibraryDetailPageProps = {
    params: { id: string };
};

export async function generateMetadata({ params }: LibraryDetailPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: library } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('id', params.id)
    .eq('category', 'Library')
    .single();

  if (!library) {
    return {
      title: 'Library Not Found | UniNest',
    };
  }

  return {
    title: `${library.name} | UniNest Libraries`,
    description: library.description,
    openGraph: {
        images: [
            {
                url: library.image_url || '/images/uninest-og-new.png',
                width: 1200,
                height: 630,
                alt: library.name,
            }
        ]
    }
  };
}

export default async function LibraryDetailPage({ params }: LibraryDetailPageProps) {
    const supabase = createClient();
    const { data: library, error } = await supabase
        .from('products')
        .select(`
            *,
            seller:seller_id (
                id,
                full_name,
                avatar_url,
                handle,
                user_metadata
            )
        `)
        .eq('id', params.id)
        .eq('category', 'Library')
        .single();
    
    if (error || !library) {
        notFound();
    }
    
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch all seat products for this library
    const { data: seatProducts } = await supabase
        .from('products')
        .select('id, name')
        .eq('seller_id', library.seller_id)
        .eq('category', 'Library Seat');

    // Fetch all relevant orders to determine seat status
    const seatProductIds = (seatProducts || []).map(p => p.id);
    const { data: orders } = await supabase
        .from('orders')
        .select('id, status, order_items!inner(product_id)')
        .eq('vendor_id', library.seller_id)
        .in('order_items.product_id', seatProductIds)
        .in('status', ['pending_approval', 'approved']);
        
    return (
      <LibraryDetailClient 
        library={library as Product} 
        initialSeatProducts={seatProducts || []}
        initialOrders={orders || []} 
        currentUser={user} 
      />
    );
}
