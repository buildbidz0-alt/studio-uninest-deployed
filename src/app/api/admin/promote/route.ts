
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { email } = await request.json();

    if (!email) {
        return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Supabase credentials are not configured on the server.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // 1. Get the user by email
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1, email: email as string });
        
        if (listError) {
            console.error('Error listing users:', listError);
            throw new Error(`Error finding user: ${listError.message}`);
        }
        
        if (!users || users.length === 0) {
            throw new Error(`User with email ${email} not found.`);
        }
        
        const user = users[0];

        // 2. Update the user's metadata with the admin role
        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { user_metadata: { ...user.user_metadata, role: 'admin' } }
        );

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ message: `Successfully promoted ${updatedUser?.email} to admin.` });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        console.error('Admin promotion error:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
