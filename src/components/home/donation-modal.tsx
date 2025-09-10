
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Heart, Loader2, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

type DonationModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const suggestedAmounts = [50, 100, 250];

export default function DonationModal({ isOpen, onOpenChange }: DonationModalProps) {
  const { openCheckout, isLoaded } = useRazorpay();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDonating, setIsDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState('100');

  const handleDonate = async () => {
    const amount = parseInt(donationAmount, 10);
    if (isNaN(amount) || amount <= 0) {
        toast({
            variant: 'destructive',
            title: 'Invalid Amount',
            description: 'Please enter a valid amount to donate.',
        });
        return;
    }
    
    if (!user) {
        toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to make a donation.' });
        return;
    }

    setIsDonating(true);
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount * 100, currency: 'INR' }),
      });
      
      const order = await response.json();

      if (!response.ok) {
          throw new Error(order.error || 'Failed to create order');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: 'UniNest Donation',
        description: 'Support student innovation!',
        order_id: order.id,
        handler: function (response: any) {
            // TODO: Call your backend to verify the payment
            // Example:
            // await fetch('/api/donation/verify', { method: 'POST', body: JSON.stringify(response) });
            toast({
              title: '🎉 Thank you for your support!',
              description: 'Your donation helps keep UniNest running.',
            });
            onOpenChange(false);
        },
        modal: {
            ondismiss: function() {
                // This function is called when the modal is closed by the user
                setIsDonating(false);
            }
        },
        prefill: {
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
        },
        notes: {
          type: 'donation',
          userId: user?.id,
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
            title: 'Donation Failed',
            description: error instanceof Error ? error.message : 'Could not connect to the payment gateway. Please try again later.',
        });
        setIsDonating(false);
    }
    // Note: isDonating will be reset in the modal.ondismiss handler if the user closes it
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                <Heart className="size-8" />
            </div>
            <DialogTitle className="text-3xl font-bold">Support UniNest</DialogTitle>
            <DialogDescription>
                Our platform is free for all students. Your donation helps cover server costs and keeps the community thriving.
            </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
                {suggestedAmounts.map(amount => (
                    <Button 
                        key={amount} 
                        variant="outline"
                        className={cn(
                            "py-6 text-lg font-bold transition-all",
                            donationAmount === amount.toString() && "bg-accent text-accent-foreground border-accent"
                        )}
                        onClick={() => setDonationAmount(amount.toString())}
                    >
                        ₹{amount}
                    </Button>
                ))}
            </div>
            <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    type="number"
                    placeholder="Custom amount"
                    className="pl-8 text-center"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                />
            </div>
        </div>

        <DialogFooter className="flex-col gap-2">
            <Button size="lg" className="w-full text-lg py-6" onClick={handleDonate} disabled={!isLoaded || isDonating || !donationAmount}>
                {isDonating ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <Heart className="mr-2 size-5" />
                )}
                {isDonating ? 'Processing...' : `Donate ₹${donationAmount || 0}`}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
                You can also donate later from the <Link href="/donate" className="underline font-semibold" onClick={() => onOpenChange(false)}>Donate</Link> page.
            </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
