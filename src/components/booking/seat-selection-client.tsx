
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Armchair, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ReservationForm from './reservation-form';
import type { User } from '@supabase/supabase-js';

type Seat = {
    id: string; 
    productId: number; 
    status: 'available' | 'booked' | 'pending';
}

export default function SeatSelectionClient() {
  const { user, supabase, loading: authLoading } = useAuth();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();
  const [libraryConfig, setLibraryConfig] = useState({ totalSeats: 50, price: 10, openingHours: '' });
  const [libraryVendorId, setLibraryVendorId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);


  const fetchSeatStatus = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);

    const { data: libraryVendor } = await supabase
        .from('profiles')
        .select('id, user_metadata')
        .eq('role', 'vendor')
        .like('user_metadata->>vendor_categories', '%library%')
        .limit(1)
        .single();
    
    if (!libraryVendor) {
        console.error("No library vendor found");
        setIsLoading(false);
        setSeats([]);
        return;
    }
    
    setLibraryVendorId(libraryVendor.id);
    const config = libraryVendor.user_metadata || { totalSeats: 50, price: 10, openingHours: '9 AM - 9 PM' };
    setLibraryConfig({
        totalSeats: config.library_details?.totalSeats || 50,
        price: config.library_details?.price || 10,
        openingHours: config.opening_hours || '9 AM - 9 PM'
    });

    const { data: seatProducts, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .eq('seller_id', libraryVendor.id)
        .eq('category', 'Library Seat');

    if (productsError) {
        console.error("Error fetching seat products:", productsError);
        setIsLoading(false);
        setSeats([]);
        return;
    }

    const { data: orders } = await supabase
        .from('orders')
        .select('id, status, order_items(products(id))')
        .eq('vendor_id', libraryVendor.id)
        .in('status', ['pending_approval', 'approved']);
    
    const seatStatusMap = new Map<number, { status: 'booked' | 'pending' }>();
    orders?.forEach(order => {
        const seatItem = order.order_items.find((item: any) => item.products?.id);
        if (seatItem) {
            const productId = seatItem.products.id;
             if (order.status === 'approved') {
                seatStatusMap.set(productId, { status: 'booked' });
            } else if (order.status === 'pending_approval') {
                seatStatusMap.set(productId, { status: 'pending' });
            }
        }
    });

    const newSeats: Seat[] = (seatProducts || []).map(product => {
        const statusInfo = seatStatusMap.get(product.id);
        return {
            id: product.name.split(' ')[1], // e.g., "Seat 24" -> "24"
            productId: product.id,
            status: statusInfo?.status || 'available',
        }
    }).sort((a, b) => parseInt(a.id) - parseInt(b.id)); 
    
    setSeats(newSeats);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!authLoading && supabase) {
        fetchSeatStatus();
    }
  }, [authLoading, fetchSeatStatus, supabase]);

  useEffect(() => {
    if(!supabase) return;
    const channel = supabase
      .channel('table-db-changes-orders-and-products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${libraryVendorId}` },
        (payload) => {
          fetchSeatStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchSeatStatus, libraryVendorId]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'available') {
        toast({
            variant: 'destructive',
            description: `This seat is already ${seat.status === 'booked' ? 'booked' : 'pending approval'}.`,
        });
        return;
    }
    setSelectedSeat(seat);
    setIsFormOpen(true);
  };
  
  const handleBookingRequest = async (bookingSlot: string) => {
    if (!selectedSeat || !user || !supabase || !libraryVendorId) {
         toast({
            variant: 'destructive',
            description: 'Please select a seat and log in to continue.',
        });
        return false;
    }
    setIsBooking(true);

    const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
        buyer_id: user.id,
        vendor_id: libraryVendorId,
        total_amount: libraryConfig.price,
        status: 'pending_approval',
        booking_slot: bookingSlot,
        booking_date: new Date().toISOString(), // For monthly, we just record the booking date
    }).select('id').single();

    if (orderError || !newOrder) {
        toast({ variant: 'destructive', description: 'Failed to create reservation request.'});
        setIsBooking(false);
        return false;
    }

    const { error: itemError } = await supabase.from('order_items').insert({
        order_id: newOrder.id,
        product_id: selectedSeat.productId,
        quantity: 1,
        price: libraryConfig.price
    });
    
    if (itemError) {
        await supabase.from('orders').delete().eq('id', newOrder.id);
        toast({ variant: 'destructive', description: 'Failed to complete reservation details.'});
        setIsBooking(false);
        return false;
    } else {
        toast({
            title: 'Reservation Requested!',
            description: `Your request for seat ${selectedSeat.id} has been sent for approval.`,
        });
        setSelectedSeat(null);
        fetchSeatStatus(); // Refresh state immediately
        setIsBooking(false);
        setIsFormOpen(false);
        return true;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Book a Study Seat (Monthly)</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Select an available seat to request a monthly reservation. Your booking will be confirmed upon vendor approval.
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-3">
            <Card>
                <CardContent className="p-4">
                    {isLoading ? (
                        <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin size-8" /></div>
                    ) : seats.length === 0 ? (
                         <div className="flex h-96 items-center justify-center text-muted-foreground">
                           <p>The library booking service is not yet configured by a vendor.</p>
                         </div>
                    ) : (
                    <div className="flex flex-col items-center space-y-6">
                        <div className="flex items-center justify-center w-full">
                            <div className="w-2/3 h-2 bg-slate-300 rounded-t-md flex items-center justify-center text-xs text-slate-500">
                                <Monitor className="size-4 mr-2" />
                                Front Desk / Screen
                            </div>
                        </div>

                        <div className="grid grid-cols-10 gap-2">
                            {seats.map((seat) => {
                                const isSelected = selectedSeat?.id === seat.id;
                                return (
                                <button
                                    key={seat.id}
                                    onClick={() => handleSeatClick(seat)}
                                    disabled={seat.status !== 'available'}
                                    className={cn(
                                    'p-1 rounded-md transition-colors relative',
                                    seat.status === 'available' && 'hover:bg-primary/20',
                                    )}
                                >
                                    <Armchair
                                    className={cn(
                                        'size-6',
                                        seat.status === 'available' && 'text-primary',
                                        seat.status === 'booked' && 'text-red-500',
                                        seat.status === 'pending' && 'text-yellow-500',
                                    )}
                                    />
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono">{seat.id}</span>
                                </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap justify-center items-center gap-x-6 pt-4 text-sm">
                            <div className="flex items-center gap-2"><Armchair className="size-5 text-primary" /><span className="text-muted-foreground">Available</span></div>
                            <div className="flex items-center gap-2"><Armchair className="size-5 text-yellow-500" /><span className="text-muted-foreground">Pending</span></div>
                            <div className="flex items-center gap-2"><Armchair className="size-5 text-red-500" /><span className="text-muted-foreground">Booked</span></div>
                        </div>
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Monthly Reservation</DialogTitle>
            <DialogDescription>
              Select your preferred shift and confirm your details for Seat {selectedSeat?.id}.
            </DialogDescription>
          </DialogHeader>
          {user && selectedSeat && (
            <ReservationForm
                seatId={selectedSeat.id}
                price={libraryConfig.price}
                user={user}
                onSubmit={handleBookingRequest}
                isLoading={isBooking}
                timeSlots={libraryConfig.openingHours.split('\n').filter(s => s.trim() !== '')}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
