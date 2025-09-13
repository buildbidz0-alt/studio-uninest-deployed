
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, IndianRupee, Loader2, FileText, Share2 } from 'lucide-react';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import { format } from 'date-fns';

type Competition = {
    id: number;
    title: string;
    description: string;
    prize: number;
    deadline: string;
    entry_fee: number;
    image_url: string | null;
    details_pdf_url: string | null;
};

type CompetitionDetailClientProps = {
    competition: Competition;
}

export default function CompetitionDetailClient({ competition }: CompetitionDetailClientProps) {
    const { openCheckout, isLoaded } = useRazorpay();
    const { toast } = useToast();
    const { user, supabase } = useAuth();
    const [isApplying, setIsApplying] = useState(false);

    const handleApply = async () => {
        if (!user || !supabase) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to apply for competitions.' });
            return;
        }

        setIsApplying(true);

        if (competition.entry_fee <= 0) {
            const { error } = await supabase.from('competition_entries').insert({
                competition_id: competition.id,
                user_id: user.id,
            });
            if (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not process your free application.' });
            } else {
                toast({ title: 'Application Successful!', description: `You have successfully applied for ${competition.title}.` });
            }
            setIsApplying(false);
            return;
        }
        
        try {
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: competition.entry_fee * 100, currency: 'INR' }),
            });

            if (!response.ok) {
                const orderError = await response.json();
                throw new Error(orderError.error || 'Failed to create order');
            }
            
            const order = await response.json();

            const options = {
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
              amount: order.amount,
              currency: order.currency,
              name: `Entry Fee: ${competition.title}`,
              description: `Payment for ${competition.title}`,
              order_id: order.id,
              handler: async function (paymentResponse: any) {
                const { error } = await supabase.from('competition_entries').insert({
                    competition_id: competition.id,
                    user_id: user.id,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                });
                 if (error) {
                    toast({ variant: 'destructive', title: 'Error Saving Application', description: 'Payment received, but failed to save your application. Please contact support.' });
                } else {
                    toast({ title: 'Payment Successful!', description: `You are now registered for ${competition.title}.` });
                }
              },
              modal: { ondismiss: () => setIsApplying(false) },
              prefill: { name: user.user_metadata?.full_name || '', email: user.email || '' },
              notes: { type: 'competition', competitionId: competition.id, userId: user.id },
              theme: { color: '#1B365D' },
            };
            openCheckout(options);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Application Failed', description: error instanceof Error ? error.message : 'Could not connect to payment gateway.' });
            setIsApplying(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <div className="space-y-4">
                {competition.image_url && (
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden">
                        <Image src={competition.image_url} alt={competition.title} fill className="object-cover" data-ai-hint="competition banner abstract" />
                    </div>
                )}
                <h1 className="text-4xl font-bold font-headline">{competition.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Trophy className="size-5 text-amber-500" />
                        <span>Prize Pool: <span className="font-bold text-foreground">₹{competition.prize.toLocaleString()}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="size-5" />
                        <span>Deadline: <span className="font-bold text-foreground">{format(new Date(competition.deadline), 'PPP')}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <IndianRupee className="size-5" />
                        <span>Entry: {competition.entry_fee > 0 ? <span className="font-bold text-foreground">₹{competition.entry_fee}</span> : <Badge variant="secondary">Free</Badge>}</span>
                    </div>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                <p>{competition.description}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <Button size="lg" className="flex-1" onClick={handleApply} disabled={(!isLoaded && competition.entry_fee > 0) || isApplying}>
                    {isApplying ? <Loader2 className="mr-2 animate-spin" /> : null}
                    Apply Now
                </Button>
                {competition.details_pdf_url && (
                    <Button size="lg" variant="outline" className="flex-1" asChild>
                        <a href={competition.details_pdf_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2"/>
                            Rulebook (PDF)
                        </a>
                    </Button>
                )}
                <Button size="lg" variant="ghost" className="flex-1">
                    <Share2 className="mr-2"/>
                    Share
                </Button>
            </div>
        </div>
    );
}
