'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseBrowserClient() {
  // IMPORTANT: The browser client should be a singleton.
  // We use `window` as a cache to ensure it's only created once.
  // @ts-ignore
  if (window.supabase) {
    // @ts-ignore
    return window.supabase as SupabaseClient;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // This will be caught by the error boundary and show a user-friendly message.
    throw new Error('Supabase URL and/or Anon Key are not defined. Please check your .env file.');
  }

  const supabase = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey
  );
  
  // @ts-ignore
  window.supabase = supabase;

  return supabase;
}
