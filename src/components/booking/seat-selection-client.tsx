
'use client';

import { useState } from 'react';
import { Armchair, Screen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// In a real app, this would come from the database
const initialSeats = [
  ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
  ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
  ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
  ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'],
  ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'],
];

const bookedSeats = new Set(['A3', 'B4', 'C1', 'E5']);
const seatPrice = 10; // Example price per seat/hour

export default function SeatSelectionClient() {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSeatClick = (seatNumber: string) => {
    if (bookedSeats.has(seatNumber)) {
        toast({
            variant: 'destructive',
            description: 'This seat is already booked.',
        });
        return;
    }
    setSelectedSeat((prev) => (prev === seatNumber ? null : seatNumber));
  };

  const handleBooking = () => {
    if (!selectedSeat) {
         toast({
            variant: 'destructive',
            description: 'Please select a seat to continue.',
        });
        return;
    }
    // TODO: Integrate with payment and booking logic
     toast({
        title: 'Booking Confirmed (Demo)',
        description: `You have booked seat ${selectedSeat}. A confirmation QR code would be generated here.`,
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Book a Study Seat</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Select an available seat from the layout below.
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-6">
                        {/* Screen */}
                        <div className="flex items-center justify-center w-full">
                            <div className="w-2/3 h-2 bg-slate-300 rounded-t-md flex items-center justify-center text-xs text-slate-500">
                                <Screen className="size-4 mr-2" />
                                Front Desk / Screen
                            </div>
                        </div>

                        {/* Seats */}
                        <div className="space-y-2">
                            {initialSeats.map((row, rowIndex) => (
                                <div key={rowIndex} className="flex justify-center gap-2">
                                {row.map((seatNumber) => {
                                    const isBooked = bookedSeats.has(seatNumber);
                                    const isSelected = selectedSeat === seatNumber;
                                    return (
                                    <button
                                        key={seatNumber}
                                        onClick={() => handleSeatClick(seatNumber)}
                                        disabled={isBooked}
                                        className={cn(
                                        'p-1 rounded-md transition-colors',
                                        isBooked ? 'cursor-not-allowed' : 'hover:bg-primary/20',
                                        isSelected && 'bg-accent'
                                        )}
                                    >
                                        <Armchair
                                        className={cn(
                                            'size-8',
                                            isBooked ? 'text-slate-400' : 'text-primary',
                                            isSelected && 'text-accent-foreground'
                                        )}
                                        />
                                        <span className="sr-only">{seatNumber}</span>
                                    </button>
                                    );
                                })}
                                </div>
                            ))}
                        </div>

                         {/* Legend */}
                        <div className="flex justify-center items-center gap-x-6 pt-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Armchair className="size-5 text-primary" />
                                <span className="text-muted-foreground">Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Armchair className="size-5 text-accent" />
                                <span className="text-muted-foreground">Selected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Armchair className="size-5 text-slate-400" />
                                <span className="text-muted-foreground">Booked</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                    <CardDescription>Confirm your selection before proceeding.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Selected Seat:</span>
                        <span className="font-bold text-lg">{selectedSeat || 'None'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-bold text-lg">{selectedSeat ? `₹${seatPrice}` : '₹0'}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" disabled={!selectedSeat} onClick={handleBooking}>
                        Book Now
                    </Button>
                </CardFooter>
            </Card>
        </div>

      </div>
    </div>
  );
}
