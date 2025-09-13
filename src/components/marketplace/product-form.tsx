
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
import { Loader2, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useRazorpay } from '@/hooks/use-razorpay';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const allCategories = ["Library", "Hostels", "Hostel Room", "Food Mess", "Cyber Café", "Books", "Other Products"];
const studentCategories = ["Books", "Other Products"];

const formSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().min(10, 'Please provide a more detailed description.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.string({ required_error: "Please select a category." }),
  image: z.any().optional(),
  location: z.string().optional(),
  total_seats: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ProductFormProps = {
  product?: {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string | null;
    location: string | null;
    total_seats: number | null;
  };
  chargeForPosts?: boolean;
  postPrice?: number;
}

export default function ProductForm({ product, chargeForPosts = false, postPrice = 0 }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, supabase, role, vendorCategories: userVendorCategories } = useAuth();
  const { openCheckout, isLoaded } = useRazorpay();
  const isEditMode = !!product;

  const getAvailableCategories = () => {
    if (role === 'student') {
        return studentCategories;
    }
    if (role === 'vendor') {
        const vendorCategories = (userVendorCategories || []).map((c: string) => {
            if (c === 'library') return 'Library';
            if (c === 'food mess') return 'Food Mess';
            if (c === 'cybercafe') return 'Cyber Café';
            if (c === 'hostels') return ['Hostels', 'Hostel Room'];
            return c;
        }).flat();
        
        const categories = [...vendorCategories];
        if (!categories.includes('Other Products')) {
          categories.push("Other Products");
        }
        return isEditMode ? allCategories : [...new Set(categories)];
    }
    return allCategories;
  }

  const availableCategories = getAvailableCategories();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || '',
      location: product?.location || '',
      total_seats: product?.total_seats || undefined,
    },
  });
  
  const selectedCategory = form.watch('category');

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!supabase || !user) return null;
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
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

  const handleCreateListing = async (values: FormValues, paymentId?: string) => {
    if (!user || !supabase) return;
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

    const { error } = await supabase.from('products').insert({
        name: values.name,
        description: values.description,
        price: values.price,
        category: values.category,
        seller_id: user.id,
        image_url: imageUrl,
        location: values.location,
        total_seats: values.category === 'Library' ? values.total_seats : undefined,
    });

     if (error) {
        toast({ variant: 'destructive', title: 'Error creating product', description: error.message });
    } else {
        toast({ title: 'Success!', description: 'Your product has been listed.' });
        const destination = role === 'vendor' ? '/vendor/products' : '/marketplace';
        router.push(destination);
        router.refresh();
    }

    setIsLoading(false);
  }

  const handleUpdateListing = async (values: FormValues) => {
    if (!user || !supabase || !product) return;
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

    const { error } = await supabase.from('products')
        .update({
            name: values.name,
            description: values.description,
            price: values.price,
            category: values.category,
            image_url: imageUrl,
            location: values.location,
            total_seats: values.category === 'Library' ? values.total_seats : null,
        })
        .eq('id', product.id);

    if (error) {
        toast({ variant: 'destructive', title: 'Error updating product', description: error.message });
    } else {
        toast({ title: 'Success!', description: 'Your product has been updated.' });
        const destination = role === 'vendor' ? '/vendor/products' : '/marketplace';
        router.push(destination);
        router.refresh();
    }

    setIsLoading(false);
  }

  async function onSubmit(values: FormValues) {
    if (!user || !supabase) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }

    if (isEditMode) {
        await handleUpdateListing(values);
        return;
    }

    if (chargeForPosts && postPrice > 0) {
        setIsLoading(true);
        try {
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: postPrice * 100, currency: 'INR' }),
            });
        
            const order = await response.json();
            if (!response.ok) throw new Error(order.error || 'Failed to create payment order.');

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
                amount: order.amount,
                currency: order.currency,
                name: 'UniNest Listing Fee',
                description: `One-time fee for posting "${values.name}"`,
                order_id: order.id,
                handler: async function (response: any) {
                    await handleCreateListing(values, response.razorpay_payment_id);
                },
                modal: { ondismiss: () => setIsLoading(false) },
                prefill: { name: user?.user_metadata?.full_name || '', email: user?.email || '' },
                notes: { type: 'listing_fee', userId: user?.id, productName: values.name },
                theme: { color: '#4A90E2' },
            };
            openCheckout(options);

        } catch(error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'Could not connect to the payment gateway.';
            toast({ variant: 'destructive', title: 'Payment Error', description: errorMessage });
            setIsLoading(false);
        }

    } else {
        await handleCreateListing(values);
    }
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Listing' : 'Create New Listing'}</CardTitle>
            <CardDescription>{isEditMode ? 'Update the details below.' : 'All fields are required.'}</CardDescription>
        </CardHeader>
        <CardContent>
            {chargeForPosts && !isEditMode && postPrice > 0 && (
                <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Listing Fee</AlertTitle>
                    <AlertDescription>
                        A one-time fee of <strong>₹{postPrice}</strong> is required to publish this listing.
                    </AlertDescription>
                </Alert>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditMode}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {availableCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>{selectedCategory === 'Library' ? 'Library Name' : selectedCategory === 'Hostels' ? 'Hostel Name' : selectedCategory === 'Hostel Room' ? 'Room Name/Number' : 'Product Name'}</FormLabel><FormControl><Input placeholder={selectedCategory === 'Library' ? "e.g., Central City Library" : "e.g., Gently Used Physics Textbook"} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your product, its condition, etc." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>{selectedCategory === 'Library' ? 'Price per Seat (INR)' : selectedCategory === 'Hostel Room' ? 'Price per month (INR)' : 'Price (INR)'}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        {selectedCategory === 'Library' && (
                            <FormField control={form.control} name="total_seats" render={({ field }) => (
                                <FormItem><FormLabel>Total Seats</FormLabel><FormControl><Input type="number" placeholder="50" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                        )}
                    </div>

                    {(selectedCategory === 'Library' || selectedCategory === 'Hostels') && (
                        <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Near Main Campus" {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>
                        )} />
                    )}
                   
                     <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                            <FormLabel>{selectedCategory === 'Library' ? 'Library Image' : selectedCategory === 'Hostels' ? 'Hostel Image' : 'Product Image'}</FormLabel>
                            {isEditMode && product.image_url && !value && (
                                <div className="mb-4">
                                    <p className="text-sm text-muted-foreground mb-2">Current image:</p>
                                    <Image src={product.image_url} alt="Current product image" width={100} height={100} className="rounded-md" />
                                </div>
                            )}
                            <FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl>
                            <FormMessage />
                        </FormItem>
                     )} />
                    <Button type="submit" disabled={isLoading || (chargeForPosts && !isEditMode && !isLoaded)}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode 
                            ? 'Save Changes' 
                            : chargeForPosts && postPrice > 0
                                ? `Proceed to Pay ₹${postPrice}`
                                : 'Create Listing'
                        }
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
