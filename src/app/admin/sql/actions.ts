
'use server';

import { createClient } from '@supabase/supabase-js';

export async function runQuery(query: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return { data: null, error: 'Supabase service role key is not configured.' };
    }

    // This client uses the service role key and bypasses RLS.
    // It should ONLY be used in secure server environments and for admin purposes.
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const { data, error } = await supabaseAdmin.rpc('execute_sql', { query });
        
        if (error) {
            console.error('SQL Execution Error:', error);
            return { data: null, error: error.message };
        }
        
        return { data: data, error: null };
    } catch (e: any) {
        console.error('Unexpected error running query:', e);
        return { data: null, error: e.message || 'An unexpected error occurred.' };
    }
}
