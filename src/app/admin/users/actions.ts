
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service role key is not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function updateUserRole(userId: string, newRole: 'co-admin' | 'student') {
    const supabaseServer = createServerClient();
    const { data: { user: currentUser } } = await supabaseServer.auth.getUser();

    if (!currentUser || currentUser.user_metadata?.role !== 'admin') {
        return { error: 'Forbidden. Only the main admin can change roles.' };
    }

    if (currentUser.id === userId) {
        return { error: 'The main admin cannot change their own role.' };
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();
        
        // Update auth user metadata
        const { data: { user: updatedUser }, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: { role: newRole } }
        );

        if (updateError) {
            throw updateError;
        }

        // Update public profiles table
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (profileError) {
            // Log this but don't fail the request, as the primary goal was met.
            console.error('Could not update role in public profiles table:', profileError);
        }
        
        revalidatePath('/admin/users');
        return { error: null, success: true, message: `User role updated to ${newRole}.` };

    } catch(e: any) {
        return { error: e.message };
    }
}
