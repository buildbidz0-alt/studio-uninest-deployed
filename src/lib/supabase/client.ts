import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function getSupabaseBrowserClient() {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // This will now prevent the crash and give a clear server-side error
    // if the variables are not configured.
    return undefined;
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);

  return client;
}
