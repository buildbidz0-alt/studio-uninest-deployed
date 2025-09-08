
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, IndianRupee, Loader2 } from 'lucide-react';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

// Mock data - replace with API call
const competitions = [
  {
    id: 1,
    title: 'UniNest National Hackathon 2024',
    prize: 50000,
    deadline: '2024-08-31',
    entryFee: 0,
    description: 'Build an innovative solution to solve a real-world problem in 48 hours. Open to all students.'
  },
  {
    id: 2,
    title: 'Campus Photography Contest',
    prize: 10000,
    deadline: '20-09-2024',
    entryFee: 100,
    description: 'Capture the spirit of your campus. The best photo wins.'
  },
  {
    id: 3,
    title: 'AI Startup Pitch Challenge',
    prize: 100000,
    deadline: '2024-10-01',
    entryFee: 500,
    description: 'Pitch your AI-powered startup idea to a panel of venture capitalists.'
  },
];

export default function CompetitionsClient() {
  const { openCheckout, isLoaded } = useRazorpay();
  const { toast } = useToast();
  const { user } = useAuth();
  const [applyingCompetitionId, setApplyingCompetitionId] = useState<number | null>(null);

  const handleApply = async (competition: typeof competitions[0]) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to apply for competitions.' });
        return;
    }

    if (competition.entryFee <= 0) {
        // Handle free application logic here
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
        {competitions.map((comp) => (
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
        ))}
      </div>
    </div>
  );
}
