
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const studentMonetizationSchema = z.object({
  charge_for_posts: z.boolean(),
  post_price: z.number().min(0),
});

const vendorMonetizationSchema = z.object({
  charge_for_platform_access: z.boolean(),
  price_per_service_per_month: z.number().min(0),
});

const settingsSchema = z.object({
  student: studentMonetizationSchema,
  vendor: vendorMonetizationSchema,
  start_date: z.string().datetime({ offset: true }).nullable(),
});

export async function POST(request: NextRequest) {
    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    // 1. Check for authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized: No user logged in.' }, { status: 401 });
    }

    // 2. Check if the user is an admin
    const isAuthAdmin = user.user_metadata?.role === 'admin';
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isProfileAdmin = profile?.role === 'admin';

    if (!isAuthAdmin && !isProfileAdmin) {
        return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    // 3. Validate request body
    const body = await request.json();
    const parsedBody = settingsSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsedBody.error.flatten() }, { status: 400 });
    }

    // 4. Upsert the settings in the database
    const { error: dbError } = await supabase
        .from('platform_settings')
        .upsert({ 
            key: 'monetization', 
            value: parsedBody.data 
        }, { 
            onConflict: 'key' 
        });

    if (dbError) {
        console.error('Error upserting settings:', dbError);
        return NextResponse.json({ error: 'Failed to save settings in database' }, { status: 500 });
    }

    // 5. Log the action to the audit log
    const { error: logError } = await supabase.from('audit_log').insert({
        admin_id: user.id,
        action: 'settings_update',
        details: 'Updated monetization settings.'
    });

    if (logError) {
        console.error("Failed to write to audit log:", logError);
        // Do not fail the request, but log the error
    }

    return NextResponse.json({ message: 'Settings updated successfully' }, { status: 200 });
}
