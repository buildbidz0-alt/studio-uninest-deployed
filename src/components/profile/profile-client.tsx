'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Award, Edit, Loader2, BookCopy, Package, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mock data, to be replaced with API calls
const myNotes = [
  { id: 1, title: "Quantum Physics Lecture 1", subject: "Physics" },
  { id: 2, title: "Intro to Algorithms Notes", subject: "Computer Science" },
];
const myListings = [
    { id: 1, title: "Used Calculus Textbook", price: "₹500" },
    { id: 2, title: "Mini Fridge for Hostel", price: "₹2500" },
];

export default function ProfileClient() {
  const { user, loading, supabase } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }
    
    if (user) {
        const fetchProfile = async () => {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) {
                setProfile(data);
            }
        }
        fetchProfile();
    }
  }, [user, loading, supabase]);

  if (loading || !user || !profile) {
    return (
      <div className="flex h-[calc(100vh-150px)] items-center justify-center">
        <Loader2 className="animate-spin size-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-32 md:h-48 primary-gradient" />
        <CardContent className="p-6 pt-0">
          <div className="flex items-end -mt-16">
            <Avatar className="size-24 md:size-32 border-4 border-card">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="text-4xl">{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold font-headline">{profile.full_name}</h1>
              <p className="text-muted-foreground">@{profile.handle}</p>
            </div>
            <Link href="/settings" className="ml-auto">
              <Button variant="outline">
                <Edit className="mr-2 size-4" />
                Edit Profile
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-muted-foreground">{profile.bio || "No bio yet."}</p>
          <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Award className="size-5" />
                  <span>2 Badges</span>
              </div>
              {/* More stats can go here */}
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card shadow-sm rounded-full">
          <TabsTrigger value="notes" className="rounded-full py-2"><BookCopy className="mr-2 size-4" />My Notes</TabsTrigger>
          <TabsTrigger value="listings" className="rounded-full py-2"><Package className="mr-2 size-4" />My Listings</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-full py-2"><Newspaper className="mr-2 size-4" />My Feed</TabsTrigger>
        </TabsList>
        <TabsContent value="notes" className="mt-6">
           <div className="space-y-4">
            {myNotes.map(note => (
                <Card key={note.id}>
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <p className="font-bold">{note.title}</p>
                            <p className="text-sm text-muted-foreground">{note.subject}</p>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                    </CardContent>
                </Card>
            ))}
           </div>
        </TabsContent>
        <TabsContent value="listings" className="mt-6">
            <div className="space-y-4">
            {myListings.map(listing => (
                <Card key={listing.id}>
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <p className="font-bold">{listing.title}</p>
                            <p className="text-sm text-muted-foreground">{listing.price}</p>
                        </div>
                        <Button variant="ghost" size="sm">Manage</Button>
                    </CardContent>
                </Card>
            ))}
           </div>
        </TabsContent>
        <TabsContent value="activity" className="mt-6">
          <p className="text-center text-muted-foreground p-8">Your recent feed activity will appear here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
