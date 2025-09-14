
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProfileClient from '@/components/profile/profile-client';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Product, PostWithAuthor, Profile } from '@/lib/types';

export const metadata: Metadata = {
  title: 'My Profile | UniNest',
  description: 'View and manage your profile, notes, listings, and activity.',
};

async function getMyProfileData(userId: string) {
    const supabase = createClient();
    
    // 1. Get the profile
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*, follower_count:followers!following_id(count), following_count:followers!follower_id(count)')
        .eq('id', userId)
        .single();
    
    if (profileError || !profileData) {
        return null;
    }

    // 2. Get related content
    const [
        listingsRes,
        postsRes,
        followersRes,
        followingRes,
        likedPostsRes
    ] = await Promise.all([
        supabase.from('products').select('*, profiles:seller_id(full_name)').eq('seller_id', userId),
        supabase.from('posts').select(`*, profiles:user_id ( full_name, avatar_url, handle ), likes ( count ), comments ( id )`).eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('followers').select('profiles!follower_id(*)').eq('following_id', userId),
        supabase.from('followers').select('profiles!following_id(*)').eq('follower_id', userId),
        supabase.from('likes').select('post_id').eq('user_id', userId)
    ]);

    const likedPostIds = new Set(likedPostsRes.data?.map(p => p.post_id) || []);

    const content = {
        listings: (listingsRes.data as any[] || []).map(p => ({ ...p, seller: p.profiles })) as Product[],
        posts: (postsRes.data || []).map(p => ({ ...p, isLiked: likedPostIds.has(p.id) })) as PostWithAuthor[],
        followers: (followersRes.data?.map((f: any) => f.profiles) as Profile[]) || [],
        following: (followingRes.data?.map((f: any) => f.profiles) as Profile[]) || [],
    };
    
    return { profile: profileData as any, content };
}


// This component acts as a wrapper to enable suspense for search params
async function ProfilePageContent() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profileData = await getMyProfileData(user.id);

  if (!profileData) {
      // This could happen if the profiles table is out of sync.
      // Redirecting to settings might allow them to fix it.
      redirect('/settings');
  }

  return <ProfileClient initialProfile={profileData.profile} initialContent={profileData.content} />;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
