

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createCompetition } from '@/app/admin/competitions/actions';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Please provide a more detailed description.'),
  prize: z.coerce.number().min(0, 'Prize must be a positive number.'),
  entry_fee: z.coerce.number().min(0, 'Entry fee must be a positive number.'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  image: z.any().optional(),
  details_pdf: z.any().optional(),
});

export default function CompetitionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      prize: 0,
      entry_fee: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
        if (value) {
            formData.append(key, value);
        }
    });

    const result = await createCompetition(formData);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      toast({ title: 'Success!', description: 'Competition created successfully.' });
      router.refresh();
      router.push('/admin/competitions');
    }
    
    setIsLoading(false);
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Competition Details</CardTitle>
            <CardDescription>All fields are required.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., National Robotics Challenge" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Detailed description of the competition..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="prize" render={({ field }) => (
                            <FormItem><FormLabel>Prize Pool (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="entry_fee" render={({ field }) => (
                            <FormItem><FormLabel>Entry Fee (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="deadline" render={({ field }) => (
                            <FormItem><FormLabel>Deadline</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem><FormLabel>Banner Image</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name="details_pdf" render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem><FormLabel>Details PDF</FormLabel><FormControl><Input type="file" accept=".pdf" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl><FormMessage /></FormItem>
                         )} />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Competition
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
