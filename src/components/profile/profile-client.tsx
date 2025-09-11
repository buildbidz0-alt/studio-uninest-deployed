
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
import type { Note, PostWithAuthor, Product } from '@/lib/types';
import NoteCard from '../notes/note-card';
import ProductCard from '../marketplace/product-card';
import PostCard from '../feed/post-card';
import { useToast } from '@/hooks/use-toast';

export default function ProfileClient() {
  const { user, loading, supabase } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [profileContent, setProfileContent] = useState<{
    notes: Note[],
    listings: Product[],
    posts: PostWithAuthor[]
  }>({ notes: [], listings: [], posts: [] });
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }
    
    if (user && supabase) {
        const fetchProfileData = async () => {
            setContentLoading(true);
            
            const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (profileData) setProfile(profileData);
            if (profileError) toast({ variant: 'destructive', title: 'Error fetching profile' });

            const { data: notesData, error: notesError } = await supabase.from('notes').select('*, profiles(full_name, avatar_url)').eq('user_id', user.id);
            if (notesError) toast({ variant: 'destructive', title: 'Error fetching notes' });
            
            const { data: listingsData, error: listingsError } = await supabase.from('products').select('*, profiles:seller_id(full_name)').eq('seller_id', user.id);
            if (listingsError) toast({ variant: 'destructive', title: 'Error fetching listings' });

            const { data: postsData, error: postsError } = await supabase
              .from('posts')
              .select(`*, profiles:user_id ( full_name, avatar_url, handle ), likes ( count ), comments ( id )`)
              .eq('user_id', user.id);
            if (postsError) toast({ variant: 'destructive', title: 'Error fetching posts' });

            const { data: likedPosts, error: likedError } = await supabase.from('likes').select('post_id').eq('user_id', user.id);
            const likedPostIds = new Set(likedPosts?.map(p => p.post_id) || []);
            
            const finalPosts = (postsData || []).map(p => ({
              ...p,
              isLiked: likedPostIds.has(p.id),
              comments: p.comments || [],
            }));

            setProfileContent({
                notes: (notesData as Note[]) || [],
                listings: (listingsData as Product[]) || [],
                posts: finalPosts as PostWithAuthor[],
            });

            setContentLoading(false);
        }
        fetchProfileData();
    }
  }, [user, loading, supabase, toast]);
  
  const handlePostAction = () => {
      // In a real app, you would refetch or update state here.
      toast({ title: 'Action not fully implemented in profile view.' });
  }

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
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card shadow-sm rounded-full">
          <TabsTrigger value="activity" className="rounded-full py-2"><Newspaper className="mr-2 size-4" />My Feed</TabsTrigger>
          <TabsTrigger value="notes" className="rounded-full py-2"><BookCopy className="mr-2 size-4" />My Notes</TabsTrigger>
          <TabsTrigger value="listings" className="rounded-full py-2"><Package className="mr-2 size-4" />My Listings</TabsTrigger>
        </TabsList>
        
        {contentLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        ) : (
          <>
            <TabsContent value="activity" className="mt-6">
                <div className="space-y-4">
                {profileContent.posts.length > 0 ? (
                    profileContent.posts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            currentUser={user}
                            onDelete={handlePostAction}
                            onEdit={handlePostAction}
                            onComment={handlePostAction}
                            onLike={handlePostAction}
                        />
                    ))
                ) : (
                    <p className="text-center text-muted-foreground p-8">You haven't posted anything yet.</p>
                )}
                </div>
            </TabsContent>
            <TabsContent value="notes" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {profileContent.notes.length > 0 ? (
                    profileContent.notes.map(note => <NoteCard key={note.id} note={note} />)
                ) : (
                    <p className="text-center text-muted-foreground p-8 sm:col-span-2">You haven't uploaded any notes yet.</p>
                )}
                </div>
            </TabsContent>
            <TabsContent value="listings" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {profileContent.listings.length > 0 ? (
                    profileContent.listings.map(listing => (
                        <ProductCard 
                            key={listing.id} 
                            product={listing} 
                            user={user}
                            onBuyNow={() => {}}
                            isBuying={false}
                            isRazorpayLoaded={false}
                        />
                    ))
                ) : (
                    <p className="text-center text-muted-foreground p-8 sm:col-span-2">You don't have any active listings.</p>
                )}
                </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
