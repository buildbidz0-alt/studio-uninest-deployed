

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

// Placeholder data - replace with API calls
const raisedAmount = 3500;
const goalAmount = 10000;
const progressPercentage = (raisedAmount / goalAmount) * 100;

const topDonors = [
  { name: 'Priya Sharma', amount: 500, avatar: 'https://picsum.photos/seed/priya/100' },
  { name: 'David Chen', amount: 300, avatar: 'https://picsum.photos/seed/david/100' },
  { name: 'Anonymous', amount: 250, avatar: '' },
];

function DonateContent() {
  const { openCheckout, isLoaded } = useRazorpay();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleDonate = async () => {
    // 1. Create Order on your backend
    // This is a mock API call. Replace with your actual API endpoint.
    // const response = await fetch('/api/razorpay/create-order', {
    //   method: 'POST',
    //   body: JSON.stringify({ amount: 5000, currency: 'INR' }), // Example amount: ₹50
    // });
    // const order = await response.json();
    
    // MOCK ORDER
    const order = {
      id: 'order_mock_' + Date.now(),
      amount: 5000, // 5000 paise = ₹50.00
      currency: 'INR'
    };

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use environment variables
      amount: order.amount,
      currency: order.currency,
      name: 'UniNest Donation',
      description: 'Support student innovation!',
      order_id: order.id,
      handler: async function (response: any) {
        // 2. Verify payment on your backend
        // const verificationResponse = await fetch('/api/razorpay/verify-payment', {
        //   method: 'POST',
        //   body: JSON.stringify({
        //     razorpay_order_id: response.razorpay_order_id,
        //     razorpay_payment_id: response.razorpay_payment_id,
        //     razorpay_signature: response.razorpay_signature,
        //   }),
        // });
        // const result = await verificationResponse.json();

        // if (result.success) {
          toast({
            title: '🎉 Thank you for your support!',
            description: 'Your donation helps keep UniNest running.',
          });
        // } else {
        //   toast({
        //     variant: 'destructive',
        //     title: 'Payment Verification Failed',
        //     description: 'Please contact support if the amount was deducted.',
        //   });
        // }
      },
      prefill: {
        name: user?.displayName || '',
        email: user?.email || '',
      },
      notes: {
        type: 'donation',
        userId: user?.uid,
      },
      theme: {
        color: '#1B365D', // Deep Sapphire Blue
      },
    };

    openCheckout(options);
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
              Our monthly server cost is ₹10,000. Every rupee helps keep the platform running and ad-free for everyone. Even ₹50 makes a difference ❤️.
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
            <Button size="lg" className="w-full text-lg" onClick={handleDonate} disabled={!isLoaded}>
                {isLoaded ? <Heart className="mr-2 size-5" /> : <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Donate Now
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
            {topDonors.map((donor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {donor.avatar && <AvatarImage src={donor.avatar} alt={donor.name} data-ai-hint="person face" />}
                    <AvatarFallback>{donor.name === 'Anonymous' ? 'A' : donor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{donor.name}</p>
                    <p className="text-sm text-muted-foreground">Donated ₹{donor.amount}</p>
                  </div>
                </div>
                <div className="font-bold text-lg text-primary">#{index + 1}</div>
              </div>
            ))}
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

export default function DonatePage() {
    return <DonateContent />
}
