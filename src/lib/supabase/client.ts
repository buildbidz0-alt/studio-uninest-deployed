'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// This is a singleton instance of the Supabase client.
// We are using a lazy initialization pattern to ensure the client is only created
// when it's first needed, and only in a browser environment.
let supabase: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  // If the client already exists, return it.
  if (supabase) {
    return supabase;
  }
  
  // If we are on the server, we don't want to create a client.
  // This is the key to preventing the build-time error.
  if (typeof window === 'undefined') {
    return null;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL and/or Anon Key are not defined. Please check your .env file.');
    return null;
  }

  // Create, store, and return the client.
  supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
  
  return supabase;
}
