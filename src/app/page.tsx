'use client';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        redirect('/feed');
      } else {
        redirect('/login');
      }
    }
  }, [user, loading]);

  return null;
}
