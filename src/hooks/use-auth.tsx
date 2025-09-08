
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

// In a real app, you'd fetch this from a database (e.g., Firestore)
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      setUser(user);
      if (user) {
        // --- MOCK ROLE DETERMINATION ---
        if (user.email === 'admin@uninest.com') {
          setRole('admin');
        } else if (user.email && user.email.includes('vendor')) {
            setRole('vendor');
        }
        else {
          setRole('student');
        }
        // --- END MOCK ---
      } else {
        setRole('guest');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    
    // Allow access to admin routes if role is admin
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
    await firebaseSignOut(auth);
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
