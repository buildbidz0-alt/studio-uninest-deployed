'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// This is the correct way to create a client-side Supabase client.
// It's a lazy-initialized singleton that ensures the client is created only once, and only in the browser.
let supabase: SupabaseClient | undefined = undefined;

export function getSupabaseBrowserClient() {
  if (typeof window === 'undefined') {
    // This function should not be called on the server.
    // If it is, it's a bug in the code.
    // We return a null-like object to avoid crashing the server build.
    return null as unknown as SupabaseClient;
  }
  
  if (supabase) {
    return supabase;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and/or Anon Key are not defined. Please check your .env file.');
  }

  supabase = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey
  );
  
  return supabase;
}
