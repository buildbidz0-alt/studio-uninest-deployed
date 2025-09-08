
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Room, Message } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

type ChatMessagesProps = {
  room: Room | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
};

export default function ChatMessages({ room, messages, onSendMessage }: ChatMessagesProps) {
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth(); // Assuming 'You' is the current user

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  if (!room) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={`https://picsum.photos/seed/${room.name}/40`} alt={room.name} data-ai-hint="person face" />
          <AvatarFallback>{room.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold">{room.name}</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.map((message) => {
            const isSentByMe = message.sender === 'You';
            return (
              <div
                key={message.id}
                className={cn('flex items-end gap-3', isSentByMe && 'justify-end')}
              >
                {!isSentByMe && (
                  <Avatar className="h-8 w-8">
                     <AvatarImage src={`https://picsum.photos/seed/${room.name}/40`} alt={room.name} data-ai-hint="person face"/>
                    <AvatarFallback>{room.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xs rounded-lg p-3 md:max-w-md',
                    isSentByMe ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                   <p className={cn("text-xs mt-1", isSentByMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                       {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
