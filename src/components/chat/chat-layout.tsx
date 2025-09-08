
'use client';

import { useState } from 'react';
import ChatList from './chat-list';
import ChatMessages from './chat-messages';
import type { Room, Message } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

type ChatLayoutProps = {
  initialRooms: Room[];
  initialMessages: Message[];
};

export default function ChatLayout({ initialRooms, initialMessages }: ChatLayoutProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(initialRooms[0] || null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const isMobile = useIsMobile();

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    // TODO: Fetch messages for the selected room from your backend API
    // e.g., fetch(`/api/chat/rooms/${room.id}/messages`).then(...)
    // For now, we'll just clear messages or set some mock data.
    if (room.id === '1') {
        setMessages(initialMessages);
    } else {
        setMessages([]);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!selectedRoom) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      sender: 'You', // This should be the current user's name or ID
      timestamp: new Date().toISOString(),
    };

    // TODO: Send the new message to your backend via API or WebSocket
    // e.g., socket.emit('sendMessage', { roomId: selectedRoom.id, text });

    setMessages(prevMessages => [...prevMessages, newMessage]);
  };
  
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
                    />
                </div>
            ) : (
                <ChatList rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />
            )}
        </div>
    )
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
        />
      </div>
    </Card>
  );
}
