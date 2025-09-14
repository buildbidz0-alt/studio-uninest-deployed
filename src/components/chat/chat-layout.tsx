
'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatList from './chat-list';
import ChatMessages from './chat-messages';
import type { Room, Message, Profile } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Camera, Loader2, Search, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function ChatLayout() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { user, supabase, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login');
    }
  }, [authLoading, user]);

  const fetchRooms = useCallback(async () => {
    if (!user || !supabase) {
      setLoadingRooms(false);
      return;
    }
    setLoadingRooms(true);
    try {
      // Call the RPC function to get all chat room data for the user
      const { data, error } = await supabase.rpc('get_chat_rooms_for_user', { p_user_id: user.id });

      if (error) {
        throw error;
      }
      
      setRooms(data || []);

    } catch (error: any) {
        console.error('Error fetching user rooms:', error);
        toast({ variant: 'destructive', title: 'Error loading chats', description: 'Could not fetch your chat rooms. Please try refreshing.' });
    } finally {
        setLoadingRooms(false);
    }
  }, [user, supabase, toast]);
  
  useEffect(() => {
    if (user && supabase) {
      fetchRooms();
    }
  }, [user, supabase, fetchRooms]);


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
    if (!isMobile && rooms.length > 0 && !selectedRoom) {
      handleSelectRoom(rooms[0]);
    }
  }, [rooms, isMobile, selectedRoom, handleSelectRoom]);

  // Real-time message subscription
  useEffect(() => {
    if (!supabase || !user) return;

    const channel = supabase
      .channel('public:chat_messages')
      .on<Message>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
           // Refetch rooms to get new "last message" and order
          fetchRooms();
          // If the message is for the currently selected room, add it to the view
          if (selectedRoom && payload.new.room_id === selectedRoom.id) {
              const newMessage = payload.new as Message;
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', newMessage.user_id)
                .single();
              
              if (!error && profileData) {
                  newMessage.profile = profileData as Profile;
              }
             setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom, supabase, fetchRooms, user]);
  

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

  const ChatListScreen = () => (
    <div className="flex flex-col h-full">
       <header className="p-4 space-y-4 bg-card border-b">
          <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary">Messages</h1>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon"><Camera className="size-5" /></Button>
                 <Button variant="ghost" size="icon"><MoreVertical className="size-5" /></Button>
              </div>
          </div>
          <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input placeholder="Search" className="pl-10 rounded-full" />
          </div>
      </header>
       {loadingRooms ? (
            <div className="flex items-center justify-center flex-1">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        ) : (
          <ChatList rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />
        )}
    </div>
  )

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <p>Please log in to view your chats.</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        {selectedRoom ? (
          <div className="flex flex-col h-full">
            <ChatMessages
              room={selectedRoom}
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedRoom(null)}
              loading={loadingMessages}
              currentUser={user}
            />
          </div>
        ) : (
          <ChatListScreen />
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-8rem)]">
      <div className="col-span-1 border-r">
        <ChatListScreen />
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
    </div>
  );
}
