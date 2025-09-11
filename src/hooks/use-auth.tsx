
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Notification } from '@/lib/types';

type UserRole = 'student' | 'vendor' | 'admin' | 'guest';

type AuthContextType = {
  supabase: SupabaseClient | undefined;
  user: User | null;
  role: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: number) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [supabase, setSupabase] = useState<SupabaseClient | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (client: SupabaseClient, userId: string) => {
    const { data, error } = await client
      .from('notifications')
      .select('*, sender:sender_id (full_name, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
    } else {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    if (!supabase || !user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (!error) {
        setNotifications(notifications.map(n => n.id === notificationId ? {...n, is_read: true} : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [supabase, user, notifications]);


  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const isSupabaseConfigured = supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey;

    if (isSupabaseConfigured) {
      const client = createBrowserClient(supabaseUrl, supabaseAnonKey);
      setSupabase(client);

      const getInitialSession = async () => {
        const { data: { session } } = await client.auth.getSession();
        const currentUser = session?.user || null;
        setUser(currentUser);
        setRole(currentUser?.user_metadata?.role || (currentUser ? 'student' : 'guest'));
        if (currentUser) {
            await fetchNotifications(client, currentUser.id);
        }
        setLoading(false);
      };

      getInitialSession();

      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setRole(currentUser?.user_metadata?.role || (currentUser ? 'student' : 'guest'));
        
        if (currentUser) {
            fetchNotifications(client, currentUser.id);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }

        if(event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          router.refresh();
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    } else {
      console.warn('Supabase credentials are not configured or are invalid. Please check your .env.local file.');
      setLoading(false);
      setUser(null);
      setSupabase(undefined);
    }
  }, [router, fetchNotifications]);


  // Realtime subscription for new notifications
  useEffect(() => {
      if (!supabase || !user) return;

      const channel = supabase.channel(`notifications_${user.id}`)
        .on<Notification>('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, 
        async (payload) => {
             const newNotification = payload.new as Notification;
             // We need to fetch the sender's profile
             const { data: senderProfile, error } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', newNotification.sender_id)
                .single();
            
             if (!error && senderProfile) {
                 newNotification.sender = senderProfile;
             }
             
             setNotifications(prev => [newNotification, ...prev]);
             setUnreadCount(prev => prev + 1);
        })
        .subscribe();
      
      return () => {
          supabase.removeChannel(channel);
      }

  }, [supabase, user]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setRole('guest');
    setNotifications([]);
    setUnreadCount(0);
    router.push('/login');
  };

  const value = {
    supabase,
    user,
    role,
    loading,
    signOut,
    notifications,
    unreadCount,
    markAsRead,
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
