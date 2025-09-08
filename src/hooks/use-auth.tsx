
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

// In a real app, you'd fetch this from a database (e.g., Firestore)
type UserRole = 'student' | 'vendor' | 'admin';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Adjusted public routes
const publicRoutes = ['/login', '/signup', '/password-reset', '/', '/about', '/terms'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('student'); // Default role
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      setUser(user);
      if (user) {
        // --- MOCK ROLE DETERMINATION ---
        // In a real app, you would fetch the user's role from your database here.
        // For example, from a 'users' collection in Firestore.
        if (user.email === 'admin@uninest.com') {
          setRole('vendor'); // Using 'vendor' role to show vendor dashboard
        } else {
          setRole('student');
        }
        // --- END MOCK ---
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublic = publicRoutes.some(publicPath => 
      pathname === publicPath || (publicPath !== '/' && pathname.startsWith(publicPath))
    );
    
    // If it's not a public route and the user is not logged in, redirect to login
    if (!isPublic && !user) {
      router.push('/login');
    }

  }, [user, loading, pathname, router]);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setRole('student'); // Reset role on sign out
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
