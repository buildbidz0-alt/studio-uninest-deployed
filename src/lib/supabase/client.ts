
import { createBrowserClient } from '@supabase/ssr'

// NOTE: This file is no longer the primary way to create a client.
// The client is now initialized directly in the AuthProvider to ensure
// environment variables are loaded correctly on the client side.
// This file is kept for potential server-side utility functions if needed in the future,
// but should be used with caution.

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
