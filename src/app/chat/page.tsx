
import type { Metadata } from 'next';
import ChatLayout from '@/components/chat/chat-layout';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'My Messages | UniNest',
  description: 'Chat with vendors and other users directly on UniNest.',
};


export default async function ChatPage() {
  const supabase = createClient();
  // The user check will be handled client-side in ChatLayout to avoid SSR redirect issues.
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch initial rooms only if user is logged in, but don't redirect from server
  let initialRooms: any[] = [];
  if (user) {
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
      // Let the client component handle the error display
    } else {
        initialRooms = rooms?.map(r => r.room).filter(Boolean).map(room => {
        if (!room) return null;
        const otherParticipant = room.participants.find(p => p.profile.id !== user.id);
        return {
          ...room,
          name: otherParticipant?.profile.full_name || 'Chat',
          avatar: otherParticipant?.profile.avatar_url || `https://picsum.photos/seed/${room.id}/40`,
        };
      }).filter(Boolean) as any[];
    }
  }

  return <ChatLayout initialRooms={initialRooms} />;
}
