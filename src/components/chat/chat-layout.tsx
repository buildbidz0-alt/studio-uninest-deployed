
'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatList from './chat-list';
import ChatMessages from './chat-messages';
import type { Room, Message } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';

type ChatLayoutProps = {
  initialRooms: Room[];
};

export default function ChatLayout({ initialRooms }: ChatLayoutProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { user, supabase, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login');
    }
  }, [authLoading, user]);


  const handleSelectRoom = useCallback(async (room: Room) => {
    if (!supabase) return;
    setSelectedRoom(room);
    setLoadingMessages(true);
    setMessages([]);

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, profile:profiles(*)')
      .eq('room_id', room.id)
      .order('created_at', { ascending: true });

    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching messages' });
      console.error(error);
    } else {
      setMessages(data || []);
    }
    setLoadingMessages(false);
  }, [supabase, toast]);

  useEffect(() => {
    if (!isMobile && initialRooms.length > 0 && !selectedRoom) {
      handleSelectRoom(initialRooms[0]);
    }
  }, [initialRooms, isMobile, selectedRoom, handleSelectRoom]);

  // Real-time message subscription
  useEffect(() => {
    if (!selectedRoom || !supabase) return;

    const channel = supabase
      .channel(`chat_room_${selectedRoom.id}`)
      .on<Message>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${selectedRoom.id}` },
        async (payload) => {
          const newMessage = payload.new as Message;
          // Fetch profile for the new message if it doesn't exist
          if (!newMessage.profile) {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', newMessage.user_id)
                .single();
              
              if (!error) {
                  newMessage.profile = profileData;
              }
          }

          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom, supabase]);
  

  const handleSendMessage = async (content: string) => {
    if (!selectedRoom || !user || !supabase) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content,
        room_id: selectedRoom.id,
        user_id: user.id,
      });

    if (error) {
      toast({ variant: 'destructive', title: 'Error sending message' });
      console.error(error);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="animate-spin text-primary size-8" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        {selectedRoom ? (
          <div className="flex flex-col h-full">
            <button onClick={() => setSelectedRoom(null)} className="flex items-center gap-2 p-2 mb-2 font-semibold text-primary">
              <ArrowLeft className="size-4" />
              All Chats
            </button>
            <ChatMessages
              room={selectedRoom}
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loadingMessages}
              currentUser={user}
            />
          </div>
        ) : (
          <ChatList rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />
        )}
      </div>
    );
  }

  return (
    <Card className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-8rem)] shadow-lg">
      <div className="col-span-1 border-r">
        <ChatList rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />
      </div>
      <div className="col-span-2 flex flex-col">
        <ChatMessages
          room={selectedRoom}
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loadingMessages}
          currentUser={user}
        />
      </div>
    </Card>
  );
}
