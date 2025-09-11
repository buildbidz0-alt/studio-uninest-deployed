'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL and/or Anon Key are not defined. Please check your .env file.');
    // Return a dummy object or null to avoid crashing the app
    // The AuthProvider will handle the null case.
    return null;
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}

// This is a singleton instance of the Supabase client.
// We are using a lazy initialization pattern to ensure the client is only created
// when it's first needed, and only in a browser environment.
let supabase: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  // If we are on the server, we don't want to create a client.
  if (typeof window === 'undefined') {
    return null;
  }
  
  // If the client doesn't exist, create it.
  if (!supabase) {
    supabase = createClient();
  }
  
  return supabase;
}
