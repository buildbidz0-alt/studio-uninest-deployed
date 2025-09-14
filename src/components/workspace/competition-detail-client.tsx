
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, IndianRupee, Loader2, FileText, Share2, Users } from 'lucide-react';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

type Competition = {
    id: number;
    title: string;
    description: string;
    prize: number;
    deadline: string;
    entry_fee: number;
    image_url: string | null;
    details_pdf_url: string | null;
    winner_id?: string | null;
    result_description?: string | null;
    winner?: {
        full_name: string;
        avatar_url: string;
    } | null;
};

type Applicant = {
    user_id: string;
    profiles: {
        full_name: string;
        avatar_url: string | null;
    } | null;
}

type CompetitionDetailClientProps = {
    competition: Competition;
    initialApplicants: Applicant[];
}

export default function CompetitionDetailClient({ competition: initialCompetition, initialApplicants }: CompetitionDetailClientProps) {
    const { openCheckout, isLoaded } = useRazorpay();
    const { toast } = useToast();
    const { user, supabase } = useAuth();
    const [isApplying, setIsApplying] = useState(false);
    const [applicants, setApplicants] = useState(initialApplicants);
    const [competition, setCompetition] = useState(initialCompetition);

    const hasApplied = applicants.some(app => app.user_id === user?.id);

    useEffect(() => {
        if (!supabase) return;
        const competitionChannel = supabase
            .channel(`competition-updates-${competition.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'competitions', filter: `id=eq.${competition.id}` }, 
            async (payload) => {
                const updatedCompetition = payload.new as Competition;
                if (updatedCompetition.winner_id) {
                    const { data: winnerProfile } = await supabase
                        .from('profiles')
                        .select('full_name, avatar_url')
                        .eq('id', updatedCompetition.winner_id)
                        .single();
                    updatedCompetition.winner = winnerProfile;
                }
                setCompetition(updatedCompetition);
            })
            .subscribe();

        const entriesChannel = supabase
            .channel(`competition-entries-${competition.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'competition_entries',
                filter: `competition_id=eq.${competition.id}`
            }, async (payload) => {
                const newEntry = payload.new as { user_id: string };
                const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', newEntry.user_id).single();
                if (profile) {
                    setApplicants(prev => [...prev, { user_id: newEntry.user_id, profiles: profile }]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(competitionChannel);
            supabase.removeChannel(entriesChannel);
        }
    }, [supabase, competition.id]);

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
    
    const handleShare = async () => {
        const shareData = {
            title: competition.title,
            text: `Check out this competition on UniNest: ${competition.title}`,
            url: window.location.href,
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Share was cancelled or failed", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                toast({ title: 'Link Copied!', description: 'Competition link copied to clipboard.' });
            } catch (err) {
                toast({ variant: 'destructive', title: 'Failed to copy link' });
            }
        }
    };

    const isCompetitionOver = new Date(competition.deadline) < new Date();

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
            
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="applicants">Applicants ({applicants.length})</TabsTrigger>
                    <TabsTrigger value="results" disabled={!isCompetitionOver || !competition.winner_id}>Results</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-6">
                     <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                        <p>{competition.description}</p>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t mt-6">
                        <Button size="lg" className="flex-1" onClick={handleApply} disabled={(!isLoaded && competition.entry_fee > 0) || isApplying || hasApplied || isCompetitionOver}>
                            {isApplying ? <Loader2 className="mr-2 animate-spin" /> : null}
                            {hasApplied ? 'Applied' : isCompetitionOver ? 'Deadline Passed' : 'Apply Now'}
                        </Button>
                        {competition.details_pdf_url && (
                            <Button size="lg" variant="outline" className="flex-1" asChild>
                                <a href={competition.details_pdf_url} target="_blank" rel="noopener noreferrer">
                                    <FileText className="mr-2"/>
                                    Rulebook (PDF)
                                </a>
                            </Button>
                        )}
                        <Button size="lg" variant="ghost" className="flex-1" onClick={handleShare}>
                            <Share2 className="mr-2"/>
                            Share
                        </Button>
                    </div>
                </TabsContent>
                <TabsContent value="applicants" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users />
                                Current Applicants
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {applicants.length > 0 ? (
                                <div className="flex flex-wrap gap-4">
                                    {applicants.map(applicant => (
                                        <div key={applicant.user_id} className="flex flex-col items-center gap-2">
                                            <Avatar>
                                                <AvatarImage src={applicant.profiles?.avatar_url || ''} />
                                                <AvatarFallback>{applicant.profiles?.full_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-center w-20 truncate">{applicant.profiles?.full_name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Be the first to apply!</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="results" className="mt-6">
                     <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                        <CardHeader className="text-center">
                            <Trophy className="mx-auto size-12 text-amber-500" />
                            <CardTitle className="text-3xl">Results Declared!</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <h3 className="text-xl font-semibold">Winner</h3>
                            <div className="inline-flex flex-col items-center gap-2">
                                <Avatar className="size-20 border-4 border-amber-400">
                                    <AvatarImage src={competition.winner?.avatar_url} />
                                    <AvatarFallback>{competition.winner?.full_name[0]}</AvatarFallback>
                                </Avatar>
                                <p className="font-bold text-2xl">{competition.winner?.full_name}</p>
                            </div>
                            {competition.result_description && (
                                <div className="pt-4">
                                     <h3 className="text-xl font-semibold">Announcement</h3>
                                     <p className="text-muted-foreground">{competition.result_description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
