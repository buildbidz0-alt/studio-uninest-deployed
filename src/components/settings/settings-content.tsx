
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Loader2, User as UserIcon } from 'lucide-react';
import { useState, type ChangeEvent, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email(),
  handle: z.string().min(3, { message: 'Handle must be at least 3 characters.' }),
  contactNumber: z.string().optional(),
  bio: z.string().max(200, 'Bio must not exceed 200 characters.').optional(),
});

const passwordFormSchema = z.object({
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});


export default function SettingsContent() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const supabase = createClient();

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      handle: '',
      contactNumber: '',
      bio: '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        handle: user.user_metadata?.handle || '',
        contactNumber: user.user_metadata?.contact_number || '',
        bio: user.user_metadata?.bio || '',
      })
    }
  }, [user, profileForm])

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user) return;
    setIsProfileLoading(true);

    const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: {
            full_name: values.fullName,
            handle: values.handle,
            contact_number: values.contactNumber,
            bio: values.bio,
        }
    });

    if (authError) {
        toast({ variant: 'destructive', title: 'Error', description: authError.message });
        setIsProfileLoading(false);
        return;
    }
    
    // Also update the public profiles table
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
            full_name: values.fullName,
            handle: values.handle,
         })
        .eq('id', user.id);

    if (profileError) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update public profile.' });
    } else {
      toast({ title: 'Profile Updated', description: 'Your profile has been updated successfully.' });
      // This will trigger a re-render in useAuth hook and update the UI
      window.location.reload();
    }
    setIsProfileLoading(false);
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    setIsPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: values.newPassword,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
      passwordForm.reset();
    }
    setIsPasswordLoading(false);
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a JPG or PNG image.' });
        return;
      }
      if (file.size > maxSize) {
        toast({ variant: 'destructive', title: 'File Too Large', description: 'Please select an image smaller than 2MB.' });
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile || !user) {
        toast({ variant: 'destructive', title: 'No file selected', description: 'Please select a photo to upload.' });
        return;
    }
    setIsPhotoLoading(true);

    const filePath = `${user.id}/${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, selectedFile);
    
    if (uploadError) {
      toast({ variant: 'destructive', title: 'Upload Error', description: uploadError.message });
      setIsPhotoLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: userUpdateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

     if (userUpdateError) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update profile picture in auth.' });
      setIsPhotoLoading(false);
      return;
    }
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);
    
     if (profileError) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update public profile picture.' });
    } else {
      toast({ title: 'Photo Uploaded', description: 'Your profile picture has been updated.' });
      setPreviewUrl(null);
      setSelectedFile(null);
      window.location.reload();
    }
    setIsPhotoLoading(false);
  }

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>Please log in to view your settings.</div>
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your avatar. This will be visible to other users.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="size-24">
                <AvatarImage src={previewUrl || user?.user_metadata?.avatar_url || ''} alt="User avatar" />
                <AvatarFallback>
                    <UserIcon className="size-12" />
                </AvatarFallback>
            </Avatar>
            <div className="grid w-full max-w-sm items-center gap-2">
                <Input id="picture" type="file" onChange={handleFileChange} accept="image/png, image/jpeg" />
                <Button onClick={handlePhotoUpload} disabled={isPhotoLoading || !selectedFile}>
                    {isPhotoLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload Photo
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={profileForm.control}
                name="handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="your_unique_handle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={profileForm.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isProfileLoading}>
                {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password here. Make sure it is a strong one.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit" disabled={isPasswordLoading}>
                 {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    