
import { createClient } from '@/lib/supabase/server';
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
  start_date: z.string().datetime().nullable().optional(),
});

export async function POST(request: NextRequest) {
    const supabase = createClient();

    // 1. Check for authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if the user is an admin
    if (user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    // 3. Validate request body
    const body = await request.json();
    const parsedBody = settingsSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsedBody.error.flatten() }, { status: 400 });
    }

    // 4. Update the settings in the database
    const { error: dbError } = await supabase
        .from('platform_settings')
        .update({ value: parsedBody.data })
        .eq('key', 'monetization');

    if (dbError) {
        console.error('Error updating settings:', dbError);
        return NextResponse.json({ error: 'Failed to update settings in database' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Settings updated successfully' }, { status: 200 });
}
