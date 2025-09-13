

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  role: z.string().min(3, 'Role must be at least 3 characters.'),
  company: z.string().min(2, 'Company name must be at least 2 characters.'),
  stipend: z.coerce.number().min(0, 'Stipend must be a positive number.'),
  stipend_period: z.string().optional(),
  location: z.string().min(2, 'Location is required.'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  image: z.instanceof(File).optional(),
  details_pdf: z.instanceof(File).optional(),
});

export default function InternshipForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { supabase, user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: '',
      company: '',
      stipend: 0,
      stipend_period: 'monthly',
      location: '',
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
        const url = await uploadFile(values.image, 'internships');
        if (!url) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload image.' });
            setIsLoading(false);
            return;
        }
        imageUrl = url;
    }

    if (values.details_pdf) {
        const url = await uploadFile(values.details_pdf, 'internships');
        if (!url) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload PDF.' });
            setIsLoading(false);
            return;
        }
        pdfUrl = url;
    }

    const { error } = await supabase.from('internships').insert({
      role: values.role,
      company: values.company,
      stipend: values.stipend,
      stipend_period: values.stipend_period,
      location: values.location,
      deadline: new Date(values.deadline).toISOString(),
      image_url: imageUrl,
      details_pdf_url: pdfUrl,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success!', description: 'Internship created successfully.' });
      router.push('/admin/dashboard');
      router.refresh();
    }
    
    setIsLoading(false);
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Internship Details</CardTitle>
            <CardDescription>All fields are required.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem><FormLabel>Role</FormLabel><FormControl><Input placeholder="e.g., Software Engineer Intern" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="company" render={({ field }) => (
                            <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="e.g., Google" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="stipend" render={({ field }) => (
                            <FormItem><FormLabel>Stipend (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="stipend_period" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stipend Period</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="lump-sum">Lump-sum</SelectItem>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                         <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Remote" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="deadline" render={({ field }) => (
                        <FormItem><FormLabel>Application Deadline</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                     )} />
                    <div className="grid md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem><FormLabel>Company Logo / Banner</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name="details_pdf" render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem><FormLabel>Job Description (PDF)</FormLabel><FormControl><Input type="file" accept=".pdf" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl><FormMessage /></FormItem>
                         )} />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Internship
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
