
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type UserRole = 'student' | 'vendor' | 'admin' | 'guest';

type AuthContextType = {
  supabase: SupabaseClient;
  user: User | null;
  role: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  // Get the Supabase client, which is now guaranteed to be a client-side singleton.
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
            setRole(currentUser.user_metadata?.role || 'student');
        } else {
            setRole('guest');
        }
        setLoading(false);
    }
    
    getInitialUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setRole(currentUser?.user_metadata?.role || (currentUser ? 'student' : 'guest'));
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole('guest');
    router.push('/login');
    router.refresh();
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
