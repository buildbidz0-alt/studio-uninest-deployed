
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Supabase credentials are not configured on the server. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY to your environment variables.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const adminEmail = 'admin@uninest.com';
    const adminPassword = '5968474644j';

    try {
        // Check if user already exists
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email: adminEmail });
        if (listError) throw new Error(`Error checking for user: ${listError.message}`);

        let user = users[0];

        // If user doesn't exist, create them
        if (!user) {
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: adminEmail,
                password: adminPassword,
                email_confirm: true, // Auto-confirm the email
                user_metadata: { 
                    full_name: 'UniNest Admin',
                    role: 'admin' 
                },
            });

            if (createError) throw new Error(`Error creating user: ${createError.message}`);
            user = newUser.user;

            // Also create a corresponding profile entry
            const { error: profileError } = await supabaseAdmin
              .from('profiles')
              .insert({
                id: user.id,
                full_name: 'UniNest Admin',
                email: adminEmail,
                role: 'admin',
                handle: 'uninestadmin'
              });
            
            if (profileError) {
              // If profile creation fails, it's not ideal but the auth user exists. Log it.
              console.warn(`Admin user created in auth, but failed to create profile: ${profileError.message}`);
            }

            return NextResponse.json({ message: `Successfully CREATED and PROMOTED admin user: ${adminEmail}. You can now log in. Please have the temporary setup file deleted.` });

        } else {
             // If user already exists, just ensure they are an admin
            const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                user.id,
                { user_metadata: { ...user.user_metadata, role: 'admin' } }
            );

            if (updateError) throw new Error(`Error promoting existing user: ${updateError.message}`);

             const { error: profileUpdateError } = await supabaseAdmin
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', user.id);
            
            if (profileUpdateError) {
               console.warn(`Admin user updated in auth, but failed to update profile role: ${profileUpdateError.message}`);
            }

            return NextResponse.json({ message: `Admin user ${adminEmail} already existed and has been successfully PROMOTED. You can now log in. Please have the temporary setup file deleted.` });
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        console.error('Admin setup error:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
