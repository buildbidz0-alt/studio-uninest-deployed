
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, IndianRupee, Loader2 } from 'lucide-react';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

// TODO: Fetch competitions from your API
const competitions: any[] = [];

export default function CompetitionsClient() {
  const { openCheckout, isLoaded } = useRazorpay();
  const { toast } = useToast();
  const { user } = useAuth();
  const [applyingCompetitionId, setApplyingCompetitionId] = useState<number | null>(null);

  const handleApply = async (competition: any) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to apply for competitions.' });
        return;
    }

    if (competition.entryFee <= 0) {
        // TODO: Handle free application logic (call your backend to register the user)
        toast({ title: 'Application Successful!', description: `You have successfully applied for ${competition.title}.` });
        return;
    }
    
    setApplyingCompetitionId(competition.id);

    try {
        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: competition.entryFee * 100, currency: 'INR' }),
        });

        if (!response.ok) {
            throw new Error('Failed to create order');
        }
        
        const order = await response.json();

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: `Entry Fee: ${competition.title}`,
          description: `Payment for ${competition.title}`,
          order_id: order.id,
          handler: async function (response: any) {
            // TODO: Call your backend to verify payment and register user for the competition
            toast({
              title: 'Payment Successful!',
              description: `You are now registered for ${competition.title}.`,
            });
          },
          prefill: {
            name: user.user_metadata?.full_name || '',
            email: user.email || '',
          },
          notes: {
            type: 'competition',
            competitionId: competition.id,
            userId: user.id,
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
            title: 'Application Failed',
            description: 'Could not connect to the payment gateway. Please try again later.',
        });
    } finally {
        setApplyingCompetitionId(null);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Competitions</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Challenge yourself, showcase your skills, and win exciting prizes.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.length > 0 ? (
            competitions.map((comp) => (
            <Card key={comp.id} className="flex flex-col">
                <CardHeader>
                <CardTitle>{comp.title}</CardTitle>
                <CardDescription className="pt-2">{comp.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="size-4 text-amber-500" />
                    <span>Prize Pool: <span className="font-semibold text-foreground">₹{comp.prize.toLocaleString()}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>Deadline: <span className="font-semibold text-foreground">{new Date(comp.deadline).toLocaleDateString()}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="size-4" />
                    <span>Entry Fee: {comp.entryFee > 0 ? <span className="font-semibold text-foreground">₹{comp.entryFee}</span> : <Badge variant="secondary">Free</Badge>}</span>
                </div>
                </CardContent>
                <CardFooter>
                <Button 
                    className="w-full" 
                    onClick={() => handleApply(comp)} 
                    disabled={(!isLoaded && comp.entryFee > 0) || applyingCompetitionId === comp.id}
                >
                    {(isLoaded || comp.entryFee === 0) && applyingCompetitionId !== comp.id ? 'Apply Now' : <Loader2 className="animate-spin"/>}
                </Button>
                </CardFooter>
            </Card>
            ))
        ) : (
            <div className="text-center text-muted-foreground py-16 md:col-span-3">
              <h2 className="text-xl font-semibold">No Competitions Found</h2>
              <p>There are no competitions running at the moment. Please check back later.</p>
            </div>
        )}
      </div>
    </div>
  );
}
