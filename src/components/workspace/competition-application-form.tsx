
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone_number: z.string().min(10, 'Please enter a valid phone number.'),
  whatsapp_number: z.string().min(10, 'Please enter a valid WhatsApp number.'),
});

type CompetitionApplicationFormProps = {
    competition: {
        id: number;
        title: string;
        entry_fee: number;
    };
    user: User;
};

export default function CompetitionApplicationForm({ competition, user }: CompetitionApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useAuth();
  const { openCheckout, isLoaded } = useRazorpay();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.user_metadata?.full_name || '',
      email: user.email || '',
      phone_number: user.user_metadata?.phone_number || '',
      whatsapp_number: user.user_metadata?.whatsapp_number || '',
    },
  });

  const saveEntry = async (values: z.infer<typeof formSchema>, paymentId?: string) => {
      const verificationResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          type: 'competition_entry',
          userId: user.id,
          competitionId: competition.id,
          phone_number: values.phone_number,
          whatsapp_number: values.whatsapp_number,
        })
    });
    
    const result = await verificationResponse.json();

    if (!verificationResponse.ok) {
        toast({ variant: 'destructive', title: 'Error Saving Entry', description: result.error || 'Your payment was processed, but we failed to save your entry. Please contact support.' });
        setIsLoading(false);
    } else {
        toast({ title: 'Entry Successful!', description: `You have successfully entered ${competition.title}.` });
        router.push(`/workspace/competitions/${competition.id}`);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (competition.entry_fee <= 0) {
        await saveEntry(values);
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
          order_id: order.id,
          handler: async (paymentResponse: any) => {
            const verificationBody = {
                orderId: order.id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                type: 'competition_entry',
                userId: user.id,
                competitionId: competition.id,
                phone_number: values.phone_number,
                whatsapp_number: values.whatsapp_number,
            };
            const verificationResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(verificationBody)
            });

            const result = await verificationResponse.json();
             if (!verificationResponse.ok) {
                toast({ variant: 'destructive', title: 'Error Saving Entry', description: result.error || 'Your payment was processed, but we failed to save your entry. Please contact support.' });
            } else {
                toast({ title: 'Entry Successful!', description: `You have successfully entered ${competition.title}.` });
                router.push(`/workspace/competitions/${competition.id}`);
            }
          },
          modal: { ondismiss: () => setIsLoading(false) },
          prefill: { name: values.name, email: values.email, contact: values.phone_number },
          notes: { type: 'competition_entry', competitionId: competition.id, userId: user.id },
          theme: { color: '#1B365D' },
        };
        openCheckout(options);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Payment Error', description: error instanceof Error ? error.message : 'Could not connect to payment gateway.'});
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Your Entry</CardTitle>
        <CardDescription>Your details will be shared with the competition organizer.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="phone_number" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="whatsapp_number" render={({ field }) => (
                    <FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            
            <Button type="submit" disabled={isLoading || !isLoaded} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {competition.entry_fee > 0 ? `Pay ₹${competition.entry_fee} and Enter` : 'Enter for Free'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
