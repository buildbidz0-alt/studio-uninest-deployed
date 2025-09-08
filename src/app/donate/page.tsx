
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Trophy, Loader2 } from 'lucide-react';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Metadata } from 'next';
import { useState, useEffect } from 'react';

// TODO: Fetch donation data from an API
const goalAmount = 10000; // This could be a static or configurable value

function DonateContent() {
  const { openCheckout, isLoaded } = useRazorpay();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDonating, setIsDonating] = useState(false);
  const [raisedAmount, setRaisedAmount] = useState(0);
  const [topDonors, setTopDonors] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Fetch raised amount and top donors from your API
    // e.g., fetch('/api/donations/stats').then(...)
    setRaisedAmount(0);
    setTopDonors([]);
  }, []);

  const progressPercentage = goalAmount > 0 ? (raisedAmount / goalAmount) * 100 : 0;
  
  const handleDonate = async (amount: number) => {
    setIsDonating(true);
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount * 100, currency: 'INR' }),
      });
      
      if (!response.ok) {
          throw new Error('Failed to create order');
      }

      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: 'UniNest Donation',
        description: 'Support student innovation!',
        order_id: order.id,
        handler: async function (response: any) {
            toast({
              title: '🎉 Thank you for your support!',
              description: 'Your donation helps keep UniNest running.',
            });
            // TODO: Call your backend to verify the payment and update donation stats
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
            description: 'Could not connect to the payment gateway. Please try again later.',
        });
    } finally {
        setIsDonating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Support UniNest</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          UniNest runs on community support. Your contribution helps us cover our monthly server costs and continue building a better platform for students.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Help Us Reach Our Goal</CardTitle>
            <CardDescription>
              Our monthly server cost is ₹{goalAmount.toLocaleString()}. Every rupee helps keep the platform running and ad-free for everyone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm font-medium">
                <span className="text-primary">Raised: ₹{raisedAmount.toLocaleString()}</span>
                <span className="text-muted-foreground">Goal: ₹{goalAmount.toLocaleString()}</span>
              </div>
            </div>
             <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => handleDonate(50)}>₹50</Button>
                <Button variant="outline" onClick={() => handleDonate(100)}>₹100</Button>
                <Button variant="outline" onClick={() => handleDonate(250)}>₹250</Button>
             </div>
            <Button size="lg" className="w-full text-lg" onClick={() => handleDonate(500)} disabled={!isLoaded || isDonating}>
                {isLoaded ? <Heart className="mr-2 size-5" /> : <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDonating ? 'Processing...' : 'Donate Now'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="text-amber-500" />
              Top Donors This Month
            </CardTitle>
            <CardDescription>Thank you for your incredible support!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topDonors.length > 0 ? (
              topDonors.map((donor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {donor.avatar && <AvatarImage src={donor.avatar} alt={donor.name} data-ai-hint="person face" />}
                      <AvatarFallback>{donor.name ? donor.name.split(' ').map((n: string) => n[0]).join('') : 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{donor.name || 'Anonymous'}</p>
                      <p className="text-sm text-muted-foreground">Donated ₹{donor.amount}</p>
                    </div>
                  </div>
                  <div className="font-bold text-lg text-primary">#{index + 1}</div>
                </div>
              ))
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>Be the first to donate!</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

       <section className="text-center bg-muted p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-primary">Your Impact</h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Your donation directly supports our mission to provide a free, high-quality, and unified digital ecosystem for students. It allows us to maintain our servers, develop new features, and expand our reach to help more learners worldwide.
          </p>
        </section>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Support UniNest – Help Us Reach Our Monthly Goal',
  description: 'UniNest runs on community support. Our monthly server cost is ₹10,000. Every rupee counts. Donate now to help keep the platform running for students.',
};

export default function DonatePage() {
    return <DonateContent />
}
