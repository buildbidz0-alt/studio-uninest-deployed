
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Trophy, Loader2, IndianRupee } from 'lucide-react';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { useAuth } from '@/hooks/use-auth';

export default function DonateContent() {
  const { openCheckout, isLoaded } = useRazorpay();
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [isDonating, setIsDonating] = useState(false);
  const [raisedAmount, setRaisedAmount] = useState(0);
  const [goalAmount, setGoalAmount] = useState(50000); // Example, could come from admin setting
  const [topDonors, setTopDonors] = useState<any[]>([]);
  const [donationAmount, setDonationAmount] = useState('100');

  useEffect(() => {
    const fetchData = async () => {
        // Fetch raised amount
        const { data: donations, error: donationsError } = await supabase
            .from('donations')
            .select('amount');
        if (donations) {
            const total = donations.reduce((sum, d) => sum + d.amount, 0);
            setRaisedAmount(total);
        }

        // Fetch top donors
        const { data: topDonorsData, error: topDonorsError } = await supabase
            .from('donations')
            .select('amount, profiles(full_name, avatar_url, email)')
            .order('amount', { ascending: false })
            .limit(5);

        if (topDonorsData) {
            // This is a simplified aggregation
            const aggregatedDonors = topDonorsData.reduce((acc: any[], current) => {
                if (!current.profiles) return acc;
                const existing = acc.find(d => d.email === current.profiles!.email);
                if (existing) {
                    existing.amount += current.amount;
                } else {
                    acc.push({
                        name: current.profiles.full_name,
                        email: current.profiles.email,
                        avatar: current.profiles.avatar_url,
                        amount: current.amount
                    });
                }
                return acc;
            }, []).sort((a,b) => b.amount - a.amount).slice(0, 3);
            setTopDonors(aggregatedDonors);
        }
    }
    fetchData();
  }, [supabase]);

  const progressPercentage = goalAmount > 0 ? (raisedAmount / goalAmount) * 100 : 0;
  
  const handleDonate = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to donate.' });
      return;
    }
    const amount = parseInt(donationAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid donation amount.',
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
        handler: async function (response: any) {
            // Save donation to the database
            const { error } = await supabase.from('donations').insert({
                user_id: user?.id,
                amount: amount,
                currency: 'INR',
                razorpay_payment_id: response.razorpay_payment_id
            });

            if (error) {
                 toast({
                    variant: 'destructive',
                    title: 'Error Saving Donation',
                    description: 'Your donation was processed, but we failed to record it. Please contact support.',
                });
            } else {
                toast({
                title: '🎉 Thank you for your support!',
                description: 'Your donation helps keep UniNest running.',
                });
                // Optimistically update UI
                setRaisedAmount(prev => prev + amount);
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
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" onClick={() => setDonationAmount('50')}>₹50</Button>
                  <Button variant="outline" onClick={() => setDonationAmount('100')}>₹100</Button>
                  <Button variant="outline" onClick={() => setDonationAmount('250')}>₹250</Button>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    type="number"
                    placeholder="Or enter a custom amount"
                    className="pl-8 text-center text-lg font-semibold"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                />
              </div>
            </div>
            <Button size="lg" className="w-full text-lg" onClick={handleDonate} disabled={!isLoaded || isDonating || !donationAmount}>
                {isLoaded ? <Heart className="mr-2 size-5" /> : <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDonating ? 'Processing...' : `Donate ₹${donationAmount || 0}`}
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
                      <p className="text-sm text-muted-foreground">Donated ₹{donor.amount.toLocaleString()}</p>
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
