
import type { Metadata } from 'next';
import ChatLayout from '@/components/chat/chat-layout';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'My Messages | UniNest',
  description: 'Chat with vendors and other users directly on UniNest.',
};


export default async function ChatPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch chat rooms the user is a part of
  const { data: rooms, error } = await supabase
    .from('chat_room_participants')
    .select(`
      room:chat_rooms (
        id,
        created_at,
        participants:chat_room_participants (
          profile:profiles (
            id,
            full_name,
            avatar_url
          )
        )
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching chat rooms:', error);
    return <div>Error loading chats.</div>;
  }

  const initialRooms = rooms?.map(r => r.room).filter(Boolean) || [];

  return <ChatLayout initialRooms={initialRooms} />;
}
