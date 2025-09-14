
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Profile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type NewChatModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (user: Profile) => void;
};

export default function NewChatModal({ isOpen, onOpenChange, onSelectUser }: NewChatModalProps) {
  const { user: currentUser, supabase } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen || !supabase) return;
      setLoading(true);

      const { data, error } = await supabase.from('profiles').select('*');

      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch users.' });
      } else {
        // Exclude the current user from the list
        setUsers(data.filter(u => u.id !== currentUser?.id));
      }
      setLoading(false);
    };

    fetchUsers();
  }, [isOpen, supabase, toast, currentUser]);

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.handle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a New Chat</DialogTitle>
          <DialogDescription>Select a user to start a conversation with.</DialogDescription>
        </DialogHeader>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
                placeholder="Search by name or handle..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <ScrollArea className="h-72">
          <div className="space-y-2 pr-4">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="animate-spin" />
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className="flex items-center gap-3 w-full p-2 rounded-lg text-left hover:bg-muted"
                >
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">@{user.handle}</p>
                  </div>
                </button>
              ))
            ) : (
                <p className="text-center text-muted-foreground pt-10">No users found.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
