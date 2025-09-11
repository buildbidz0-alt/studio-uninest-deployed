
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

type UserRole = 'student' | 'vendor' | 'admin' | 'guest';

type AuthContextType = {
  supabase: SupabaseClient | undefined;
  user: User | null;
  role: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export function AuthProvider({ children, supabaseUrl, supabaseAnonKey }: AuthProviderProps) {
  const router = useRouter();
  const [supabase, setSupabase] = useState<SupabaseClient | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only create the client if the URL and Key are provided and are not the placeholder values
    const isSupabaseConfigured = 
      supabaseUrl && 
      supabaseAnonKey &&
      supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' &&
      supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE';

    if (isSupabaseConfigured) {
      const client = createBrowserClient(supabaseUrl, supabaseAnonKey);
      setSupabase(client);

      const getInitialUser = async () => {
        const { data: { user } } = await client.auth.getUser();
        setUser(user);
        setRole(user?.user_metadata?.role || (user ? 'student' : 'guest'));
        setLoading(false);
      };

      getInitialUser();

      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        setRole(session?.user?.user_metadata?.role || (session?.user ? 'student' : 'guest'));
        if(event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          router.refresh();
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    } else {
      // If credentials are not provided or are placeholders, stop loading and show the app in a logged-out state.
      console.warn('Supabase credentials are not configured or are using placeholder values. Please check your .env.local file.');
      setLoading(false);
      setUser(null);
      setSupabase(undefined);
    }
  }, [router, supabaseUrl, supabaseAnonKey]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setRole('guest');
    router.push('/login');
  };

  const value = {
    supabase,
    user,
    role,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
