
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { type User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

type UserRole = 'student' | 'vendor' | 'admin' | 'guest';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/password-reset', '/', '/about', '/terms'];
const studentGuestRoutes = ['/marketplace', '/workspace', '/feed', '/notes', '/donate'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setLoading(true);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const userRole = currentUser.user_metadata?.role || 'student';
        setRole(userRole);
      } else {
        setRole('guest');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (loading) return;

    if (pathname.startsWith('/admin')) {
      if (role !== 'admin') {
        router.push('/');
      }
      return;
    }

    const isPublic = publicRoutes.includes(pathname) || 
                     studentGuestRoutes.some(route => pathname.startsWith(route));

    if (!isPublic && role === 'guest') {
      router.push('/login');
    }
  }, [user, loading, pathname, router, role]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole('guest');
    router.push('/login');
  };

  const value = { user, loading, role, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
