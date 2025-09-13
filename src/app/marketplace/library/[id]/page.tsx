
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
                handle
            )
        `)
        .eq('id', params.id)
        .eq('category', 'Library')
        .single();
    
    if (error || !library) {
        notFound();
    }
    
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch all relevant orders to determine seat status
    const { data: orders } = await supabase
        .from('orders')
        .select('id, status, order_items(seat_number)')
        .eq('vendor_id', library.seller_id)
        .eq('order_items.library_id', library.id)
        .in('status', ['pending_approval', 'approved']);
        
    return <LibraryDetailClient library={library as Product} initialOrders={orders || []} currentUser={user} />;
}
