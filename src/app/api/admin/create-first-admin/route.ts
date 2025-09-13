
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs'; // Required for 'fs' module

// THIS IS A ONE-TIME-USE FILE. IT WILL SELF-DESTRUCT AFTER THE FIRST SUCCESSFUL RUN.

export async function GET(request: NextRequest) {
    // HARDCODED EMAIL for the first admin user.
    // IMPORTANT: Make sure a user with this email has already signed up.
    const emailToPromote = 'admin@uninest.com';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Supabase credentials are not configured on the server. Please set SUPABASE_SERVICE_KEY.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    try {
        // 1. Get the user by email
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1, email: emailToPromote });
        
        if (listError) {
            throw new Error(`Error finding user: ${listError.message}`);
        }
        
        if (!users || users.length === 0) {
            return NextResponse.json({ error: `User with email ${emailToPromote} not found. Please ensure the user has signed up first.` }, { status: 404 });
        }
        
        const user = users[0];

        // 2. Update the user's metadata with the admin role
        const { data: { user: updatedUser }, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { user_metadata: { ...user.user_metadata, role: 'admin' } }
        );

        if (updateError) {
            throw updateError;
        }

        // 3. Update the public profiles table as well. This is CRITICAL.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);

        if (profileError) {
             console.error('Could not update role in public profiles table:', profileError);
        }

        // 4. SELF-DESTRUCT: Delete this file after successful promotion.
        try {
            const filePath = path.join(process.cwd(), 'src/app/api/admin/create-first-admin/route.ts');
            await fs.unlink(filePath);

             // Also attempt to remove the parent directory if it's empty
            try {
                const dirPath = path.dirname(filePath);
                const files = await fs.readdir(dirPath);
                if (files.length === 0) {
                    await fs.rmdir(dirPath);
                }
            } catch (rmdirError) {
                // It's okay if this fails, the main file is gone.
                console.warn('Could not remove directory after self-destruct:', rmdirError);
            }

        } catch (fsError) {
            console.error("CRITICAL: Failed to self-destruct admin creation file. Please remove it manually.", fsError);
            return NextResponse.json({ 
                message: `Successfully promoted ${updatedUser?.email} to admin.`,
                warning: "Could not self-destruct API route. Please delete 'src/app/api/admin/create-first-admin' manually for security." 
            });
        }


        return NextResponse.json({ message: `Successfully promoted ${updatedUser?.email} to admin. This route has been deleted.` });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        console.error('Admin promotion error:', errorMessage);
        return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
    }
}
