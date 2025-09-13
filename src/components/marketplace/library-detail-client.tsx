
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Loader2, MessageSquare, MapPin, Armchair, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Product } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type Seat = {
    id: string; 
    status: 'available' | 'booked' | 'pending';
}

type LibraryDetailClientProps = {
    library: Product;
    initialOrders: any[];
    currentUser: User | null;
}

export default function LibraryDetailClient({ library, initialOrders, currentUser }: LibraryDetailClientProps) {
    const { supabase } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [currentOrders, setCurrentOrders] = useState(initialOrders);

    const totalSeats = library.total_seats || 50;
    const pricePerSeat = library.price || 10;

    const generateSeats = useCallback((orders: any[]) => {
        const seatStatusMap = new Map<string, 'booked' | 'pending'>();
        orders.forEach(order => {
            const seatNumberItem = order.order_items.find((item: any) => item.seat_number);
            if (seatNumberItem) {
                 const seatNumber = seatNumberItem.seat_number.toString();
                 if (order.status === 'approved') {
                    seatStatusMap.set(seatNumber, 'booked');
                } else if (order.status === 'pending_approval') {
                    seatStatusMap.set(seatNumber, 'pending');
                }
            }
        });

        const newSeats: Seat[] = Array.from({ length: totalSeats }, (_, i) => {
            const seatId = (i + 1).toString();
            return {
                id: seatId,
                status: seatStatusMap.get(seatId) || 'available',
            };
        });
        setSeats(newSeats);
    }, [totalSeats]);

    useEffect(() => {
        generateSeats(currentOrders);
    }, [currentOrders, generateSeats]);

    useEffect(() => {
        if (!supabase) return;

        const fetchAndSetOrders = async () => {
             const { data: newOrdersData } = await supabase
                .from('orders')
                .select('id, status, order_items(seat_number)')
                .eq('vendor_id', library.seller_id)
                .eq('order_items.library_id', library.id)
                .in('status', ['pending_approval', 'approved']);
            
            if (newOrdersData) {
                setCurrentOrders(newOrdersData);
            }
        };

        const channel = supabase
          .channel(`library_${library.id}_orders`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${library.seller_id}` },
            (payload) => {
                fetchAndSetOrders();
            }
          )
          .subscribe();
    
        return () => {
          supabase.removeChannel(channel);
        };
    }, [supabase, library.id, library.seller_id]);


    const handleSeatClick = (seat: Seat) => {
        if (seat.status !== 'available') {
            toast({
                variant: 'destructive',
                description: `Seat ${seat.id} is already ${seat.status}.`,
            });
            return;
        }
        setSelectedSeat((prev) => (prev?.id === seat.id ? null : seat));
    };

    const handleBookingRequest = async () => {
        if (!selectedSeat || !currentUser || !supabase) {
             toast({
                variant: 'destructive',
                description: 'Please select a seat and log in to continue.',
            });
            return;
        }
        setIsBooking(true);

        const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
            buyer_id: currentUser.id,
            vendor_id: library.seller_id,
            total_amount: pricePerSeat,
            status: 'pending_approval'
        }).select('id').single();

        if (orderError || !newOrder) {
            toast({ variant: 'destructive', description: 'Failed to create reservation request.'});
            setIsBooking(false);
            return;
        }

        const { error: itemError } = await supabase.from('order_items').insert({
            order_id: newOrder.id,
            product_id: library.id,
            quantity: 1,
            price: pricePerSeat,
            seat_number: parseInt(selectedSeat.id),
            library_id: library.id,
        });
        
        if (itemError) {
            await supabase.from('orders').delete().eq('id', newOrder.id);
            toast({ variant: 'destructive', description: 'Failed to complete reservation details.'});
        } else {
            toast({
                title: 'Reservation Requested!',
                description: `Your request for seat ${selectedSeat.id} has been sent for approval.`,
            });
            setSelectedSeat(null);
        }
        setIsBooking(false);
    }

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8">
            <div className="grid md:grid-cols-5 gap-8">
                <div className="md:col-span-2 space-y-6">
                     <Card className="overflow-hidden">
                        <div className="relative aspect-[4/3]">
                            <Image
                                src={library.image_url || 'https://picsum.photos/seed/library-detail/800/600'}
                                alt={library.name}
                                fill
                                className="object-cover"
                                data-ai-hint="library interior books"
                            />
                        </div>
                    </Card>
                    <h1 className="text-3xl lg:text-4xl font-bold font-headline">{library.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-5" />
                        <span className="font-semibold text-foreground">{library.location || 'Location not specified'}</span>
                    </div>
                    <p className="text-muted-foreground">{library.description}</p>
                    
                    <Card className="bg-muted/50">
                        <CardContent className="p-4">
                             <Link href={`/profile/${library.seller.handle}`} className="flex items-center gap-4">
                                <Avatar className="size-12">
                                    <AvatarImage src={library.seller.avatar_url || undefined} />
                                    <AvatarFallback>{library.seller.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm text-muted-foreground">Managed by</p>
                                    <p className="font-bold text-lg">{library.seller.full_name}</p>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Book Your Seat</CardTitle>
                            <CardDescription>Select an available seat from the layout below.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col items-center space-y-6">
                            <div className="w-2/3 h-2 bg-slate-300 rounded-t-md flex items-center justify-center text-xs text-slate-500">
                                <Monitor className="size-4 mr-2" />
                                Front Desk / Screen
                            </div>
                            <div className="grid grid-cols-10 gap-2">
                                {seats.map((seat) => (
                                    <button
                                        key={seat.id}
                                        onClick={() => handleSeatClick(seat)}
                                        disabled={seat.status !== 'available'}
                                        className={cn(
                                            'p-1 rounded-md transition-colors relative aspect-square flex items-center justify-center',
                                            seat.status === 'available' && 'hover:bg-primary/20',
                                            selectedSeat?.id === seat.id && 'bg-accent',
                                        )}
                                    >
                                        <Armchair
                                            className={cn(
                                                'size-6',
                                                seat.status === 'available' && 'text-primary',
                                                seat.status === 'booked' && 'text-red-500',
                                                seat.status === 'pending' && 'text-yellow-500',
                                                selectedSeat?.id === seat.id && 'text-accent-foreground'
                                            )}
                                        />
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono">{seat.id}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-x-6 pt-4 text-sm">
                                <div className="flex items-center gap-2"><Armchair className="size-5 text-primary" /><span className="text-muted-foreground">Available</span></div>
                                <div className="flex items-center gap-2"><Armchair className="size-5 text-accent" /><span className="text-muted-foreground">Selected</span></div>
                                <div className="flex items-center gap-2"><Armchair className="size-5 text-yellow-500" /><span className="text-muted-foreground">Pending</span></div>
                                <div className="flex items-center gap-2"><Armchair className="size-5 text-red-500" /><span className="text-muted-foreground">Booked</span></div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch space-y-4">
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-muted-foreground">Selected Seat:</span>
                                <span className="font-bold">{selectedSeat?.id || 'None'}</span>
                            </div>
                             <div className="flex justify-between items-center text-lg">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-bold">{selectedSeat ? `₹${pricePerSeat} (Pay at library)` : '₹0'}</span>
                            </div>
                            <Button size="lg" className="w-full" disabled={!selectedSeat || !currentUser || isBooking} onClick={handleBookingRequest}>
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
