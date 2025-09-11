
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type UserRole = 'student' | 'vendor' | 'admin' | 'guest';

type AuthContextType = {
  supabase: SupabaseClient | undefined;
  user: User | null;
  role: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setRole(session?.user?.user_metadata?.role || (session?.user ? 'student' : 'guest'));
      setLoading(false);
      if (event === 'SIGNED_IN') {
        router.refresh();
      }
    });
    
    // Get initial user
    supabase.auth.getUser().then(({data: { user }}) => {
        setUser(user);
        setRole(user?.user_metadata?.role || (user ? 'student' : 'guest'));
        setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const signOut = async () => {
    if (!supabase) return;
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
