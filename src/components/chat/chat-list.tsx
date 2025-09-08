
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Room } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

type ChatListProps = {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
};

export default function ChatList({ rooms, selectedRoom, onSelectRoom }: ChatListProps) {
  return (
    <div className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
                  selectedRoom?.id === room.id ? 'bg-muted' : 'hover:bg-muted/50'
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={room.avatar} alt={room.name} data-ai-hint="person face" />
                  <AvatarFallback>{room.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="font-semibold">{room.name}</p>
                  {/* TODO: Add last message preview */}
                  <p className="text-sm text-muted-foreground truncate">Select to view messages</p>
                </div>
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                    {/* TODO: Add real timestamp and unread count */}
                    {/* <span>{formatDistanceToNow(new Date(room.timestamp), { addSuffix: true })}</span>
                    {room.unreadCount > 0 && (
                        <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        {room.unreadCount}
                        </span>
                    )} */}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">No active chats.</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
