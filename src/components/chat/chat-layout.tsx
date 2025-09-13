
'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatList from './chat-list';
import ChatMessages from './chat-messages';
import type { Room, Message } from '@/lib/types';
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
  
  useEffect(() => {
    if (user && supabase) {
      const fetchRooms = async () => {
        setLoadingRooms(true);
        // Step 1: Fetch all room IDs the user is part of
        const { data: participantData, error: participantError } = await supabase
          .from('chat_room_participants')
          .select('room_id')
          .eq('user_id', user.id);

        if (participantError) {
          console.error('Error fetching user rooms:', participantError);
          toast({ variant: 'destructive', title: 'Error loading chats' });
          setLoadingRooms(false);
          return;
        }

        const roomIds = participantData.map(p => p.room_id);
        if (roomIds.length === 0) {
            setRooms([]);
            setLoadingRooms(false);
            return;
        }
        
        // Step 2: Fetch all participants for those rooms
        const { data: allParticipants, error: allParticipantsError } = await supabase
            .from('chat_room_participants')
            .select(`
                room_id,
                profile:profiles ( id, full_name, avatar_url )
            `)
            .in('room_id', roomIds);

        if (allParticipantsError) {
            console.error('Error fetching participants:', allParticipantsError);
            toast({ variant: 'destructive', title: 'Error loading chat details' });
            setLoadingRooms(false);
            return;
        }

        // Step 3: Process the data to build the Room objects
        const roomsMap = new Map<string, Room>();
        for (const p of allParticipants) {
            if (!p.room_id || !p.profile) continue;

            const otherParticipant = p.profile.id !== user.id ? p.profile : null;

            if (!roomsMap.has(p.room_id)) {
                roomsMap.set(p.room_id, {
                    id: p.room_id,
                    created_at: '', // This can be fetched if needed, but not essential for display
                    participants: [],
                    name: 'Chat', // Default name
                    avatar: `https://picsum.photos/seed/${p.room_id}/40`,
                });
            }

            const room = roomsMap.get(p.room_id)!;
            room.participants.push({ profile: p.profile });

            if (otherParticipant) {
                room.name = otherParticipant.full_name || 'Chat';
                room.avatar = otherParticipant.avatar_url || `https://picsum.photos/seed/${p.room_id}/40`;
            }
        }
        
        setRooms(Array.from(roomsMap.values()));
        setLoadingRooms(false);
      }
      fetchRooms();
    }
  }, [user, supabase, toast]);


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

  const ChatListScreen = () => (
    <div className="h-full flex flex-col">
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
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary size-8" />
            </div>
        ) : (
          <ChatList rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />
        )}
    </div>
  )

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
