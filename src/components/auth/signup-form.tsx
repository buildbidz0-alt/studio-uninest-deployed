
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
  role: z.enum(["student", "library", "food mess", "cybercafe", "hostels"], {
    required_error: "You need to select a role.",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'vendor' | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  function handleRoleSelection(role: 'student' | 'vendor') {
    setSelectedRole(role);
    if (role === 'student') {
        form.setValue('role', 'student');
    } else {
        form.setValue('role', 'library'); // Default vendor role
    }
  }

  function handleVendorCategorySelection(category: "library" | "food mess" | "cybercafe" | "hostels") {
    form.setValue('role', category);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      console.log('User created with role:', values.role);

      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
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
             <div className="space-y-3">
                <FormLabel>I am a...</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                    type="button"
                    variant={selectedRole === 'student' ? 'default' : 'outline'}
                    onClick={() => handleRoleSelection('student')}
                    >
                    Student
                    </Button>
                    <Button
                    type="button"
                    variant={selectedRole === 'vendor' ? 'default' : 'outline'}
                    onClick={() => handleRoleSelection('vendor')}
                    >
                    Vendor
                    </Button>
                </div>
            </div>

            {selectedRole === 'vendor' && (
                <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <Separator />
                        <FormLabel>Select Vendor Category</FormLabel>
                        <FormControl>
                            <div className="grid grid-cols-2 gap-2">
                                <Button type="button" variant={field.value === 'library' ? 'default' : 'outline'} onClick={() => handleVendorCategorySelection('library')}>Library</Button>
                                <Button type="button" variant={field.value === 'food mess' ? 'default' : 'outline'} onClick={() => handleVendorCategorySelection('food mess')}>Food Mess</Button>
                                <Button type="button" variant={field.value === 'cybercafe' ? 'default' : 'outline'} onClick={() => handleVendorCategorySelection('cybercafe')}>Cybercafe</Button>
                                <Button type="button" variant={field.value === 'hostels' ? 'default' : 'outline'} onClick={() => handleVendorCategorySelection('hostels')}>Hostels</Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
            )}
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
            <Button type="submit" className="w-full" disabled={isLoading || !selectedRole}>
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
