
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Room } from '@/lib/types';
import { format, isToday, isYesterday, formatDistanceToNowStrict } from 'date-fns';

type ChatListProps = {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
};

function formatTimestamp(timestamp: string | null) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';

    return formatDistanceToNowStrict(date, { addSuffix: true });
}


export default function ChatList({ rooms, selectedRoom, onSelectRoom }: ChatListProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors',
                  selectedRoom?.id === room.id ? 'bg-muted' : 'hover:bg-muted/50'
                )}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={room.avatar || `https://picsum.photos/seed/${room.id}/40`} alt={room.name || 'Chat'} data-ai-hint="person face" />
                  <AvatarFallback>{room.name?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate border-b border-border pb-3">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg truncate">{room.name}</p>
                    <p className={cn(
                        "text-xs flex-shrink-0 ml-2",
                        room.unread_count && room.unread_count > 0 ? "text-primary font-bold" : "text-muted-foreground"
                    )}>
                        {formatTimestamp(room.last_message_timestamp)}
                    </p>
                  </div>
                   <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground truncate">{room.last_message || 'Select to view messages'}</p>
                        {room.unread_count && room.unread_count > 0 && (
                            <div className="flex-shrink-0 ml-2 size-5 primary-gradient rounded-full flex items-center justify-center text-xs text-white font-bold">
                                {room.unread_count}
                            </div>
                        )}
                   </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
                <h3 className="font-semibold text-lg text-foreground">No Chats Yet</h3>
                <p>Start a conversation with a seller from the marketplace.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
