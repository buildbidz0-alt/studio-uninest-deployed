
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Edit, Loader2, Package, Newspaper, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import type { PostWithAuthor, Product, Profile } from '@/lib/types';
import ProductCard from '../marketplace/product-card';
import PostCard from '../feed/post-card';
import { useToast } from '@/hooks/use-toast';
import UserListCard from './user-list-card';

type ProfileWithCounts = Profile & {
    follower_count: { count: number }[];
    following_count: { count: number }[];
    isMyProfile: boolean;
}

type ProfileContent = {
    listings: Product[];
    posts: PostWithAuthor[];
    followers: Profile[];
    following: Profile[];
}

type ProfileClientProps = {
    initialProfile: ProfileWithCounts;
    initialContent: ProfileContent;
}

export default function ProfileClient({ initialProfile, initialContent }: ProfileClientProps) {
  const { user, loading: authLoading, supabase } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileWithCounts>(initialProfile);
  const [followerCount, setFollowerCount] = useState(initialProfile.follower_count?.[0]?.count ?? 0);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // isMyProfile is now passed down from the server component
  const isMyProfile = profile.isMyProfile;

  useEffect(() => {
    const checkFollowingStatus = async () => {
        if (!user || isMyProfile || !supabase) return;
        
        const { count } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', user.id).eq('following_id', profile.id);
        setIsFollowing(count ? count > 0 : false);
    };
    checkFollowingStatus();
  }, [user, profile, isMyProfile, supabase]);


  const handleFollowToggle = async () => {
    if (!user || isMyProfile || !supabase) {
        toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to follow users.' });
        return;
    }

    setIsFollowLoading(true);

    if (isFollowing) {
        const { error } = await supabase.from('followers').delete().match({ follower_id: user.id, following_id: profile.id });
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not unfollow user.' });
        } else {
            setIsFollowing(false);
            setFollowerCount(c => c - 1);
        }
    } else {
        const { error } = await supabase.from('followers').insert({ follower_id: user.id, following_id: profile.id });
         if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not follow user.' });
        } else {
            setIsFollowing(true);
            setFollowerCount(c => c + 1);
        }
    }
    setIsFollowLoading(false);
  }
  
  const handlePostAction = () => {
      toast({ title: 'Action not fully implemented in profile view.' });
  }

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-150px)] items-center justify-center">
        <Loader2 className="animate-spin size-10 text-primary" />
      </div>
    );
  }

  if (!profile) {
    notFound();
  }

  const avatarUrl = profile.avatar_url;
  const profileFullName = profile.full_name || 'Anonymous User';
  const followingCount = profile.following_count?.[0]?.count ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="overflow-hidden">
        <div className="h-32 md:h-48 primary-gradient" />
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 -mt-16">
            <Avatar className="size-24 md:size-32 border-4 border-card">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-4xl">{profileFullName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="mt-2 sm:mt-0 flex-grow">
              <h1 className="text-2xl md:text-3xl font-bold font-headline">{profileFullName}</h1>
              <p className="text-muted-foreground">@{profile.handle}</p>
            </div>
            <div className="mt-2 sm:mt-0 ml-auto">
              {isMyProfile ? (
                 <Link href="/settings">
                    <Button variant="outline">
                        <Edit className="mr-2 size-4" />
                        Edit Profile
                    </Button>
                </Link>
              ) : (
                <Button onClick={handleFollowToggle} disabled={isFollowLoading || !user}>
                    {isFollowLoading ? <Loader2 className="mr-2 size-4 animate-spin"/> : <UserPlus className="mr-2 size-4" />}
                    {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </div>
          </div>
          <p className="mt-4 text-muted-foreground">{profile.bio || "No bio yet."}</p>
          <div className="mt-4 flex items-center gap-6 text-sm">
             <span className="font-semibold text-foreground">{followingCount}</span> Following
             <span className="font-semibold text-foreground">{followerCount}</span> Followers
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-card shadow-sm rounded-full">
          <TabsTrigger value="activity" className="rounded-full py-2"><Newspaper className="mr-2 size-4" />Feed</TabsTrigger>
          <TabsTrigger value="listings" className="rounded-full py-2"><Package className="mr-2 size-4" />Listings</TabsTrigger>
          <TabsTrigger value="followers" className="rounded-full py-2"><Users className="mr-2 size-4" />Followers</TabsTrigger>
          <TabsTrigger value="following" className="rounded-full py-2"><Users className="mr-2 size-4" />Following</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="mt-6">
            <div className="space-y-4">
            {initialContent.posts.length > 0 ? (
                initialContent.posts.map(post => (
                    <PostCard 
                        key={post.id} 
                        post={post} 
                        currentUser={user}
                        onDelete={handlePostAction}
                        onEdit={handlePostAction}
                        onComment={handlePostAction}
                        onLike={handlePostAction}
                        onFollow={async () => false}
                    />
                ))
            ) : (
                <p className="text-center text-muted-foreground p-8">No posts yet.</p>
            )}
            </div>
        </TabsContent>
        <TabsContent value="listings" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {initialContent.listings.length > 0 ? (
                initialContent.listings.map(listing => (
                    <ProductCard 
                        key={listing.id} 
                        product={listing} 
                        user={user}
                        onBuyNow={() => {}}
                        onChat={() => {}}
                        isBuying={false}
                        isRazorpayLoaded={false}
                    />
                ))
            ) : (
                <p className="text-center text-muted-foreground p-8 sm:col-span-2">No active listings.</p>
            )}
            </div>
        </TabsContent>
        <TabsContent value="followers" className="mt-6">
             <UserListCard users={initialContent.followers} emptyMessage="Not followed by any users yet." />
        </TabsContent>
        <TabsContent value="following" className="mt-6">
            <UserListCard users={initialContent.following} emptyMessage="Not following any users yet." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
