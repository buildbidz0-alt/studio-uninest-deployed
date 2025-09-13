
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Armchair, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Seat = {
    id: string;
    status: 'available' | 'booked' | 'pending';
    orderId?: number;
}

export default function SeatSelectionClient() {
  const { user, supabase, loading: authLoading } = useAuth();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [libraryConfig, setLibraryConfig] = useState({ totalSeats: 50, price: 10 });


  const fetchSeatStatus = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);

    const { data: libraryVendor } = await supabase
        .from('profiles')
        .select('id, user_metadata')
        .eq('role', 'vendor')
        .like('user_metadata->vendor_categories', '%"library"%')
        .limit(1)
        .single();
    
    if (!libraryVendor) {
        console.error("No library vendor found");
        setIsLoading(false);
        setSeats([]);
        return;
    }

    const config = libraryVendor.user_metadata?.library_details || { totalSeats: 50, price: 10 };
    setLibraryConfig(config);

    const { data: orders } = await supabase
        .from('orders')
        .select('id, status, order_items(products(name))')
        .eq('vendor_id', libraryVendor.id)
        .in('status', ['pending_approval', 'approved']);
    
    const seatMap = new Map<string, { status: 'booked' | 'pending' }>();
    orders?.forEach(order => {
        const seatNameMatch = order.order_items[0]?.products?.name?.match(/Seat (\d+)/);
        if (seatNameMatch && seatNameMatch[1]) {
            const seatNumber = seatNameMatch[1];
             if (order.status === 'approved') {
                seatMap.set(seatNumber, { status: 'booked' });
            } else if (order.status === 'pending_approval') {
                seatMap.set(seatNumber, { status: 'pending' });
            }
        }
    });

    const newSeats: Seat[] = Array.from({ length: config.totalSeats }, (_, i) => {
        const seatId = `${i + 1}`;
        const seatInfo = seatMap.get(seatId);
        return {
            id: seatId,
            status: seatInfo?.status || 'available',
        }
    });
    
    setSeats(newSeats);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!authLoading) {
        fetchSeatStatus();
    }
  }, [supabase, authLoading, fetchSeatStatus]);

  useEffect(() => {
    if(!supabase) return;
    const channel = supabase
      .channel('table-db-changes-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          fetchSeatStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchSeatStatus]);

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (seat?.status !== 'available') {
        toast({
            variant: 'destructive',
            description: `This seat is already ${seat?.status === 'booked' ? 'booked' : 'pending approval'}.`,
        });
        return;
    }
    setSelectedSeat((prev) => (prev === seatId ? null : prev));
    setSelectedSeat(seatId);
  };

  const handleBookingRequest = async () => {
    if (!selectedSeat || !user || !supabase) {
         toast({
            variant: 'destructive',
            description: 'Please select a seat and log in to continue.',
        });
        return;
    }
    setIsBooking(true);

    const { data: libraryVendor } = await supabase.from('profiles').select('id').eq('role', 'vendor').like('user_metadata->vendor_categories', '%"library"%').limit(1).single();
    if (!libraryVendor) {
        toast({ variant: 'destructive', description: "Library service not available." });
        setIsBooking(false);
        return;
    }
    
    // The vendor must create a "Library Services" product first.
    let { data: seatProduct } = await supabase.from('products').select('*').eq('seller_id', libraryVendor.id).eq('category', 'Library Services').limit(1).single();
    
    if (!seatProduct) {
        toast({ variant: 'destructive', description: "The library vendor has not set up their booking service yet." });
        setIsBooking(false);
        return;
    }

    const { data: newOrder, error } = await supabase.from('orders').insert({
        buyer_id: user.id,
        vendor_id: libraryVendor.id,
        total_amount: libraryConfig.price, // Set the price from config
        status: 'pending_approval'
    }).select('id').single();

    if (error || !newOrder) {
        toast({ variant: 'destructive', description: 'Failed to create reservation request.'});
        setIsBooking(false);
        return;
    }

    // Associate the product (e.g. "Seat 24 reservation") with the order
    const { error: itemError } = await supabase.from('order_items').insert({
        order_id: newOrder.id,
        product_id: seatProduct.id,
        quantity: 1,
        price: libraryConfig.price
    });
    
    if (itemError) {
        await supabase.from('orders').delete().eq('id', newOrder.id);
        toast({ variant: 'destructive', description: 'Failed to complete reservation details.'});
    } else {
        toast({
            title: 'Reservation Requested!',
            description: `Your request for seat ${selectedSeat} has been sent for approval.`,
        });
        setSelectedSeat(null);
        fetchSeatStatus(); // Refresh state immediately
    }
    
    setIsBooking(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Book a Study Seat</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Select an available seat to request a reservation. Your booking will be confirmed upon vendor approval.
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
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
                                const isSelected = selectedSeat === seat.id;
                                return (
                                <button
                                    key={seat.id}
                                    onClick={() => handleSeatClick(seat.id)}
                                    disabled={seat.status !== 'available'}
                                    className={cn(
                                    'p-1 rounded-md transition-colors relative',
                                    seat.status === 'available' && 'hover:bg-primary/20',
                                    isSelected && 'bg-accent',
                                    )}
                                >
                                    <Armchair
                                    className={cn(
                                        'size-6',
                                        seat.status === 'available' && 'text-primary',
                                        seat.status === 'booked' && 'text-red-500',
                                        seat.status === 'pending' && 'text-yellow-500',
                                        isSelected && 'text-accent-foreground'
                                    )}
                                    />
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono">{seat.id}</span>
                                </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap justify-center items-center gap-x-6 pt-4 text-sm">
                            <div className="flex items-center gap-2"><Armchair className="size-5 text-primary" /><span className="text-muted-foreground">Available</span></div>
                            <div className="flex items-center gap-2"><Armchair className="size-5 text-accent" /><span className="text-muted-foreground">Selected</span></div>
                            <div className="flex items-center gap-2"><Armchair className="size-5 text-yellow-500" /><span className="text-muted-foreground">Pending</span></div>
                            <div className="flex items-center gap-2"><Armchair className="size-5 text-red-500" /><span className="text-muted-foreground">Booked</span></div>
                        </div>
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                    <CardDescription>Confirm your selection to request a reservation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Selected Seat:</span>
                        <span className="font-bold text-lg">{selectedSeat || 'None'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-bold text-lg">{selectedSeat ? `₹${libraryConfig.price} (Pay at library)` : '₹0'}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" disabled={!selectedSeat || !user || isBooking} onClick={handleBookingRequest}>
                        {isBooking && <Loader2 className="animate-spin mr-2" />}
                        Request Reservation
                    </Button>
                </CardFooter>
            </Card>
        </div>

      </div>
    </div>
  );
}
