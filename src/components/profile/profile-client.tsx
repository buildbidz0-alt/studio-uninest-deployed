
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Edit, Loader2, Package, Newspaper, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { PostWithAuthor, Product, Profile } from '@/lib/types';
import ProductCard from '../marketplace/product-card';
import PostCard from '../feed/post-card';
import { useToast } from '@/hooks/use-toast';
import UserListCard from './user-list-card';

type ProfileWithCounts = Profile & {
    follower_count: number;
    following_count: number;
}

export default function ProfileClient() {
  const { user, loading: authLoading, supabase } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const handleFromParams = params.handle as string | undefined;

  const [profile, setProfile] = useState<ProfileWithCounts | null>(null);
  const [profileContent, setProfileContent] = useState<{
    listings: Product[],
    posts: PostWithAuthor[],
    followers: Profile[],
    following: Profile[],
  }>({ listings: [], posts: [], followers: [], following: [] });
  
  const [contentLoading, setContentLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isMyProfile = !handleFromParams || (user?.user_metadata?.handle === handleFromParams);

  useEffect(() => {
    const fetchProfileData = async (handle: string) => {
        if (!supabase) return;
        setContentLoading(true);

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select(`*`)
            .eq('handle', handle)
            .single();
        
        if (profileError || !profileData) {
            toast({ variant: 'destructive', title: 'Error fetching profile', description: 'This profile could not be found.' });
            console.error("Profile fetch error:", profileError);
            router.push('/');
            return;
        }
        
        const userId = profileData.id;

        const { count: follower_count } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId);

        const { count: following_count } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', userId);

        const finalProfile = {
            ...profileData,
            follower_count: follower_count || 0,
            following_count: following_count || 0,
        };

        setProfile(finalProfile);
        
        if (user && user.id !== userId) {
            const { count } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', user.id).eq('following_id', userId);
            if (count && count > 0) {
                setIsFollowing(true);
            }
        }

        const { data: listingsData } = await supabase.from('products').select('*, profiles:seller_id(full_name)').eq('seller_id', userId);
        const { data: postsData } = await supabase.from('posts').select(`*, profiles:user_id ( full_name, avatar_url, handle ), likes ( count ), comments ( id )`).eq('user_id', userId).order('created_at', { ascending: false });
        const { data: followersData } = await supabase.from('followers').select('follower:follower_id(*)').eq('following_id', userId);
        const { data: followingData } = await supabase.from('followers').select('following:following_id(*)').eq('follower_id', userId);

        const likedPostIds = new Set();
        if (user) {
            const { data: likedPosts } = await supabase.from('likes').select('post_id').eq('user_id', user.id);
            likedPosts?.forEach(p => likedPostIds.add(p.post_id));
        }
        
        setProfileContent({
            listings: (listingsData as any[] || []).map(p => ({ ...p, seller: p.profiles })) as Product[],
            posts: (postsData || []).map(p => ({ ...p, isLiked: likedPostIds.has(p.id) })) as PostWithAuthor[],
            followers: (followersData?.map((f: any) => f.follower) as Profile[]) || [],
            following: (followingData?.map((f: any) => f.following) as Profile[]) || [],
        });
        
        setContentLoading(false);
    };

    if (authLoading) return;
    
    const targetHandle = handleFromParams || user?.user_metadata?.handle;

    if (targetHandle) {
        fetchProfileData(targetHandle);
    } else if (!handleFromParams && !user) {
        router.push('/login');
    }
  }, [user, authLoading, handleFromParams, supabase, toast, router]);

  const handleFollowToggle = async () => {
    if (!user || !profile || isMyProfile || !supabase) return;
    setIsFollowLoading(true);

    if (isFollowing) {
        const { error } = await supabase.from('followers').delete().match({ follower_id: user.id, following_id: profile.id });
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not unfollow user.' });
        } else {
            setIsFollowing(false);
            setProfile(p => p ? { ...p, follower_count: p.follower_count - 1 } : null);
        }
    } else {
        const { error } = await supabase.from('followers').insert({ follower_id: user.id, following_id: profile.id });
         if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not follow user.' });
        } else {
            setIsFollowing(true);
            setProfile(p => p ? { ...p, follower_count: p.follower_count + 1 } : null);
        }
    }
    setIsFollowLoading(false);
  }
  
  const handlePostAction = () => {
      toast({ title: 'Action not fully implemented in profile view.' });
  }

  if (authLoading || contentLoading || !profile) {
    return (
      <div className="flex h-[calc(100vh-150px)] items-center justify-center">
        <Loader2 className="animate-spin size-10 text-primary" />
      </div>
    );
  }

  const avatarUrl = isMyProfile ? user?.user_metadata?.avatar_url : profile.avatar_url;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="overflow-hidden">
        <div className="h-32 md:h-48 primary-gradient" />
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 -mt-16">
            <Avatar className="size-24 md:size-32 border-4 border-card">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-4xl">{profile.full_name?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="mt-2 sm:mt-0 flex-grow">
              <h1 className="text-2xl md:text-3xl font-bold font-headline">{profile.full_name}</h1>
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
                <Button onClick={handleFollowToggle} disabled={isFollowLoading}>
                    {isFollowLoading ? <Loader2 className="mr-2 size-4 animate-spin"/> : <UserPlus className="mr-2 size-4" />}
                    {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </div>
          </div>
          <p className="mt-4 text-muted-foreground">{profile.bio || "No bio yet."}</p>
          <div className="mt-4 flex items-center gap-6 text-sm">
             <span className="font-semibold text-foreground">{profile.following_count}</span> Following
             <span className="font-semibold text-foreground">{profile.follower_count}</span> Followers
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
                {profileContent.listings.length > 0 ? (
                    profileContent.listings.map(listing => (
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
                 <UserListCard users={profileContent.followers} emptyMessage="Not followed by any users yet." />
            </TabsContent>
            <TabsContent value="following" className="mt-6">
                <UserListCard users={profileContent.following} emptyMessage="Not following any users yet." />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
