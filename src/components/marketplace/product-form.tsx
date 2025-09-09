
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

const categories = ["Library Services", "Food Mess", "Cyber Café", "Books", "Hostels", "Other Products"];

const formSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().min(10, 'Please provide a more detailed description.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.string({ required_error: "Please select a category." }),
  image: z.any().optional(), // Allow optional image for edit mode
});

type ProductFormProps = {
  product?: {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string | null;
  }
}

export default function ProductForm({ product }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const { user } = useAuth();

  const isEditMode = !!product;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || '',
    },
  });

  const uploadFile = async (file: File): Promise<string | null> => {
    const filePath = `public/${user?.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);
      
    return publicUrl;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    
    setIsLoading(true);
    
    let imageUrl = product?.image_url || null;
    
    if (values.image && values.image instanceof File) {
        imageUrl = await uploadFile(values.image);
        if (!imageUrl) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload image.' });
            setIsLoading(false);
            return;
        }
    }

    if (isEditMode) {
        const { error } = await supabase.from('products')
            .update({
                name: values.name,
                description: values.description,
                price: values.price,
                category: values.category,
                image_url: imageUrl,
            })
            .eq('id', product.id);

        if (error) {
            toast({ variant: 'destructive', title: 'Error updating product', description: error.message });
        } else {
            toast({ title: 'Success!', description: 'Your product has been updated.' });
            router.push('/vendor/products');
            router.refresh();
        }
    } else {
        const { error } = await supabase.from('products').insert({
            name: values.name,
            description: values.description,
            price: values.price,
            category: values.category,
            seller_id: user.id,
            image_url: imageUrl,
        });

        if (error) {
            toast({ variant: 'destructive', title: 'Error creating product', description: error.message });
        } else {
            toast({ title: 'Success!', description: 'Your product has been listed.' });
            router.push('/vendor/products');
            router.refresh();
        }
    }
    
    setIsLoading(false);
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Product' : 'Product Details'}</CardTitle>
            <CardDescription>{isEditMode ? 'Update the details below.' : 'All fields are required.'}</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Gently Used Physics Textbook" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your product, its condition, etc." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>Price (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="category" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                            <FormLabel>Product Image</FormLabel>
                            {isEditMode && product.image_url && (
                                <div className="mb-4">
                                    <Image src={product.image_url} alt="Current product image" width={100} height={100} className="rounded-md" />
                                </div>
                            )}
                            <FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl>
                            <FormMessage />
                        </FormItem>
                     )} />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Save Changes' : 'Create Listing'}
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
