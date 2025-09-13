

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
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Please provide a more detailed description.'),
  prize: z.coerce.number().min(0, 'Prize must be a positive number.'),
  entry_fee: z.coerce.number().min(0, 'Entry fee must be a positive number.'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  image: z.instanceof(File).optional(),
  details_pdf: z.instanceof(File).optional(),
});

export default function CompetitionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { supabase, user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      prize: 0,
      entry_fee: 0,
    },
  });

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    if (!supabase || !user) return null;
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return publicUrl;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!supabase) return;
    setIsLoading(true);
    
    let imageUrl: string | undefined = undefined;
    let pdfUrl: string | undefined = undefined;

    if (values.image) {
        const url = await uploadFile(values.image, 'competitions');
        if (!url) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload image.' });
            setIsLoading(false);
            return;
        }
        imageUrl = url;
    }

    if (values.details_pdf) {
        const url = await uploadFile(values.details_pdf, 'competitions');
        if (!url) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload PDF.' });
            setIsLoading(false);
            return;
        }
        pdfUrl = url;
    }

    const { error } = await supabase.from('competitions').insert({
      title: values.title,
      description: values.description,
      prize: values.prize,
      entry_fee: values.entry_fee,
      deadline: new Date(values.deadline).toISOString(),
      image_url: imageUrl,
      details_pdf_url: pdfUrl,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success!', description: 'Competition created successfully.' });
      router.push('/admin/dashboard');
      router.refresh();
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
