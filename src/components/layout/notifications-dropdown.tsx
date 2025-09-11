'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, UserPlus, Newspaper } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/types';

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    switch (type) {
        case 'new_follower':
            return <UserPlus className="size-4 text-blue-500" />;
        case 'new_post':
            return <Newspaper className="size-4 text-green-500" />;
        default:
            return <Bell className="size-4" />;
    }
}

export default function NotificationsDropdown() {
    const { notifications, unreadCount, markAsRead } = useAuth();
    const router = useRouter();

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        if (notification.type === 'new_post' && notification.post_id) {
            // This is a simplified navigation. A real app might need a dedicated post page.
            router.push('/feed'); 
        }
        if (notification.type === 'new_follower' && notification.sender) {
             // You would need a way to get the handle. Assuming it's part of the sender object.
             // This is a placeholder and needs a proper profile page route.
             // router.push(`/profile/${notification.sender.handle}`);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <DropdownMenuItem 
                            key={notification.id} 
                            className={cn("flex items-start gap-3 p-2", !notification.is_read && "bg-blue-50 dark:bg-blue-900/20")}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <Avatar className="size-8 mt-1">
                                {notification.sender?.avatar_url && <AvatarImage src={notification.sender.avatar_url} />}
                                <AvatarFallback>{notification.sender?.full_name[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm">
                                    <span className="font-semibold">{notification.sender?.full_name || 'Someone'}</span>
                                    {notification.type === 'new_post' && ' created a new post.'}
                                    {notification.type === 'new_follower' && ' started following you.'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled>
                        <p className="text-sm text-center text-muted-foreground w-full py-4">No new notifications</p>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
