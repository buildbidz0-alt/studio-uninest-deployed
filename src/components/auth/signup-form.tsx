
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/hooks/use-auth';

const vendorCategories = ["library", "food mess", "cybercafe", "hostels"] as const;

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
  userType: z.enum(["student", "vendor"], {
    required_error: "You need to select a role.",
  }),
  vendorCategories: z.array(z.string()).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(data => {
    if (data.userType === 'vendor') {
      return data.vendorCategories && data.vendorCategories.length > 0;
    }
    return true;
}, {
    message: "Please select at least one vendor category.",
    path: ["vendorCategories"],
});

type FormValues = z.infer<typeof formSchema>;

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      vendorCategories: [],
    },
  });

  const userType = form.watch('userType');

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    if (!supabase) {
        toast({ variant: 'destructive', title: 'Auth not configured.'});
        setIsLoading(false);
        return;
    }
    
    const role = values.userType;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          role: role,
          full_name: values.fullName,
          vendor_categories: role === 'vendor' ? values.vendorCategories : undefined
        }
      }
    });

    if (signUpError) {
       toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: signUpError.message,
      });
      setIsLoading(false);
      return;
    }

    if (signUpData.user) {
        // Explicitly create a profile record
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({ 
                id: signUpData.user.id,
                full_name: values.fullName,
                role: role,
                handle: `user${signUpData.user.id.substring(0, 8)}`,
             });

        if (profileError) {
            toast({
                variant: 'destructive',
                title: 'Sign Up Incomplete',
                description: `Your account was created, but we failed to create your profile. Please contact support. Error: ${profileError.message}`,
            });
        } else {
            toast({
                title: 'Success!',
                description: 'Check your email for a verification link.',
            });
            router.push('/login');
        }
    }
    
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Join the community and get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>I am a...</FormLabel>
                   <FormControl>
                     <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={field.value === 'student' ? 'default' : 'outline'}
                          onClick={() => field.onChange('student')}
                        >
                          Student
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === 'vendor' ? 'default' : 'outline'}
                          onClick={() => field.onChange('vendor')}
                        >
                          Vendor
                        </Button>
                    </div>
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {userType === 'vendor' && (
              <FormField
                control={form.control}
                name="vendorCategories"
                render={() => (
                  <FormItem>
                     <Separator className="my-4" />
                    <div className="mb-4">
                      <FormLabel className="text-base">Vendor Categories</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    {vendorCategories.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="vendorCategories"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {item}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
             <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || !userType}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline">
            Log in
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
