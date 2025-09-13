
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserListCard from '@/components/profile/user-list-card';
import type { Profile } from '@/lib/types';
import PageHeader from '@/components/admin/page-header';

async function getConnectionsData(userId: string) {
    const supabase = createClient();
    
    const [followersRes, followingRes] = await Promise.all([
        supabase.from('followers').select('profiles!follower_id(*)').eq('following_id', userId),
        supabase.from('followers').select('profiles!following_id(*)').eq('follower_id', userId),
    ]);

    const followers = (followersRes.data?.map((f: any) => f.profiles) as Profile[]) || [];
    const following = (followingRes.data?.map((f: any) => f.profiles) as Profile[]) || [];

    return { followers, following };
}


export default async function ConnectionsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?redirect=/social/connections');
    }

    const { followers, following } = await getConnectionsData(user.id);
    
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <PageHeader 
                title="My Connections"
                description="Manage your followers and who you're following."
            />

            <Tabs defaultValue="followers" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
                    <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="followers" className="mt-6">
                    <UserListCard users={followers} emptyMessage="You don't have any followers yet." />
                </TabsContent>
                <TabsContent value="following" className="mt-6">
                    <UserListCard users={following} emptyMessage="You are not following anyone yet." />
                </TabsContent>
            </Tabs>
        </div>
    );
}
