
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
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL and/or Anon Key are not defined. Please check your .env file.');
      setLoading(false);
      setUser(null);
      setSupabase(undefined);
      return;
    }
    
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
