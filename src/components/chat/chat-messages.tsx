
'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Room, Message } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

type ChatMessagesProps = {
  room: Room | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  loading: boolean;
  currentUser: User | null;
};

export default function ChatMessages({ room, messages, onSendMessage, loading, currentUser: user }: ChatMessagesProps) {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('div');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  if (loading) {
     return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }
  
  const roomAvatar = room.avatar || `https://picsum.photos/seed/${room.id}/40`;
  const roomName = room.name || 'Chat';

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={roomAvatar} alt={roomName} data-ai-hint="person face" />
          <AvatarFallback>{roomName.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold">{roomName}</h2>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => {
            const isSentByMe = message.user_id === user?.id;
            const senderProfile = message.profile;
            const senderAvatar = senderProfile?.avatar_url || 'https://picsum.photos/seed/user/40/40';
            const senderName = senderProfile?.full_name || 'User';

            return (
              <div
                key={message.id}
                className={cn('flex items-end gap-3', isSentByMe && 'justify-end')}
              >
                {!isSentByMe && (
                  <Avatar className="h-8 w-8">
                     <AvatarImage src={senderAvatar} alt={senderName} data-ai-hint="person face"/>
                    <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xs rounded-lg p-3 md:max-w-md',
                    isSentByMe ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                   <p className={cn("text-xs mt-1", isSentByMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                       {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                </div>
                 {isSentByMe && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url || 'https://picsum.photos/id/237/40/40'} alt="Your avatar" />
                    <AvatarFallback>{user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2 border-t p-4">
        <Button variant="ghost" size="icon">
          <Paperclip className="size-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend}>
          <Send className="size-5" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
