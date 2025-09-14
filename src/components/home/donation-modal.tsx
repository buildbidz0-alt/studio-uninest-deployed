

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

type DonationModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

type TopDonor = {
  name: string;
  amount: number;
} | null;

const suggestedAmounts = [50, 100, 250];

export default function DonationModal({ isOpen, onOpenChange }: DonationModalProps) {
  const router = useRouter();
  const { openCheckout, isLoaded } = useRazorpay();
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [isDonating, setIsDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState('100');
  const [topDonor, setTopDonor] = useState<TopDonor>(null);

  useEffect(() => {
    if (isOpen && supabase) {
        const fetchTopDonor = async () => {
             const { data: donations } = await supabase.from('donations').select('amount, profiles(full_name, email)');

            if (!donations || donations.length === 0) return;

            const aggregatedDonors = donations.reduce((acc: any[], current) => {
                if (!current.profiles) return acc;
                const existing = acc.find(d => d.email === current.profiles!.email);
                if (existing) {
                    existing.amount += current.amount;
                } else {
                    acc.push({
                        name: current.profiles.full_name,
                        email: current.profiles.email,
                        amount: current.amount
                    });
                }
                return acc;
            }, []).sort((a: any, b: any) => b.amount - a.amount);
            
            if (aggregatedDonors.length > 0) {
              setTopDonor(aggregatedDonors[0]);
            }
        };
        fetchTopDonor();
    }
  }, [isOpen, supabase]);

  const handlePaymentSuccess = async (paymentResponse: any, accessToken: string) => {
    const amount = parseInt(donationAmount, 10);
    const verificationResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            orderId: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            type: 'donation',
            amount: amount,
        })
    });

    const result = await verificationResponse.json();
    setIsDonating(false);

    if (!verificationResponse.ok) {
         toast({ variant: 'destructive', title: 'Donation record failed', description: result.error || 'Your payment was successful but we couldn\'t record it. Please contact support.' });
    } else {
        router.push(`/donate/thank-you?amount=${amount}`);
    }
    onOpenChange(false);
  }

  const handleDonate = async () => {
    const amount = parseInt(donationAmount, 10);
    if (isNaN(amount) || amount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to donate.'});
        return;
    }
    
    if (!user) {
        onOpenChange(false);
        toast({ 
            title: 'Login to Donate', 
            description: 'Please log in to make a donation.',
            action: <Link href="/login"><Button>Login</Button></Link>
        });
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
      if (!response.ok) throw new Error(order.error || 'Failed to create payment order.');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: 'UniNest Donation',
        description: 'Support student innovation!',
        order_id: order.id,
        handler: handlePaymentSuccess,
        modal: { ondismiss: () => setIsDonating(false) },
        prefill: { name: user?.user_metadata?.full_name || '', email: user?.email || '' },
        notes: { type: 'donation', userId: user?.id },
        theme: { color: '#4A90E2' },
      };
      openCheckout(options);

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Donation Failed', description: error instanceof Error ? error.message : 'Could not connect to the payment gateway.'});
        setIsDonating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center p-8">
        <DialogHeader className="space-y-4">
            <div className="relative mx-auto w-24 h-32">
                <div className="absolute bottom-0 left-0 w-full h-full">
                    <svg viewBox="0 0 100 120" className="w-full h-full">
                        <path d="M10 110 C 10 120, 90 120, 90 110 L 90 20 C 90 10, 70 0, 50 0 C 30 0, 10 10, 10 20 Z" fill="#F5F6FA" stroke="#2C3E50" strokeWidth="4"/>
                        <path d="M8 20 L 92 20" stroke="#2C3E50" strokeWidth="4" />
                    </svg>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-full p-1.5">
                    <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: '0 0 40px 40px'}}>
                        <div className="absolute bottom-0 left-0 w-full primary-gradient animate-fill-jar"></div>
                    </div>
                </div>
            </div>
            <DialogTitle className="text-3xl font-bold font-headline">Keep the Hive Buzzing!</DialogTitle>
            <DialogDescription className="text-lg">
                Support UniNest to keep student life thriving ✨
            </DialogDescription>
        </DialogHeader>

        {topDonor && (
             <div className="text-sm text-center bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full px-3 py-1">
                🌟 Top Donor Today: <strong>{topDonor.name}</strong> — ₹{topDonor.amount.toLocaleString()}
            </div>
        )}

        <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
                {suggestedAmounts.map(amount => (
                    <Button 
                        key={amount} 
                        variant="outline"
                        className={cn(
                            "py-6 text-lg font-bold transition-all border-2",
                            donationAmount === amount.toString() && "primary-gradient text-primary-foreground border-transparent"
                        )}
                        onClick={() => setDonationAmount(amount.toString())}
                    >
                        ₹{amount}
                    </Button>
                ))}
            </div>
        </div>

        <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full text-lg py-7" onClick={handleDonate} disabled={isLoaded === false || isDonating}>
                {isDonating ? ( <Loader2 className="mr-2 h-5 w-5 animate-spin" /> ) : ( <Sparkles className="mr-2 size-5" /> )}
                {isDonating ? 'Processing...' : `Fuel the Future — ₹${donationAmount || 0}`}
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Maybe Later</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

