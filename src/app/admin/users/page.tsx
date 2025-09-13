
import PageHeader from "@/components/admin/page-header";
import AdminUsersContent from "@/components/admin/users/content";
import { createClient } from "@supabase/supabase-js";
import type { UserProfile } from "@/components/admin/users/content";

export const revalidate = 0; // force dynamic rendering

export default async function AdminUsersPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    let users: UserProfile[] = [];
    let error: string | null = null;

    if (!supabaseUrl || !supabaseServiceKey) {
        error = "Supabase service credentials are not configured.";
    } else {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
            console.error("Error fetching auth users:", authError);
            error = "Could not fetch users from authentication service.";
        } else {
            const { data: profiles, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('*');

            if (profileError) {
                console.warn("Could not fetch all profiles, some user data may be incomplete.", profileError);
            }

            users = authUsers.users.map(authUser => {
                const profile = profiles?.find(p => p.id === authUser.id);
                return {
                    id: authUser.id,
                    full_name: profile?.full_name || authUser.user_metadata?.full_name || 'N/A',
                    email: authUser.email || 'N/A',
                    avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
                    role: authUser.user_metadata?.role || 'student',
                    created_at: authUser.created_at,
                };
            });
        }
    }

    return (
        <div className="space-y-8">
            <PageHeader title="User Management" description="View and manage user roles." />
            <AdminUsersContent initialUsers={users} initialError={error} />
        </div>
    );
}
