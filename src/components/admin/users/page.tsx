
'use client';

import PageHeader from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserCog } from "lucide-react";

type UserProfile = {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    role: string;
    created_at: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const { supabase } = useAuth();
    const { toast } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
            console.error("Error fetching auth users:", authError);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch users.' });
            setLoading(false);
            return;
        }

        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*');

        if (profileError) {
            console.error("Error fetching profiles:", profileError);
        }

        const combinedUsers = authUsers.users.map(authUser => {
            const profile = profiles?.find(p => p.id === authUser.id);
            return {
                id: authUser.id,
                full_name: profile?.full_name || authUser.user_metadata?.full_name || 'N/A',
                email: authUser.email || 'N/A',
                avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
                role: authUser.user_metadata?.role || 'student',
                created_at: authUser.created_at,
            };
        });

        setUsers(combinedUsers as UserProfile[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [supabase]);
    
    const makeAdmin = async (userId: string) => {
        const { data, error } = await supabase.auth.admin.updateUserById(
            userId,
            { user_metadata: { role: 'admin' } }
        )
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update user role.' });
        } else {
             const { error: profileError } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', userId);
            if(profileError) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Could not update public profile role.' });
            } else {
                toast({ title: 'Success', description: 'User promoted to Admin.' });
                fetchUsers();
            }
        }
    }

    return (
        <div className="space-y-8">
            <PageHeader title="User Management" description="View and manage user roles." />
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        <Loader2 className="mx-auto animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-9">
                                                    <AvatarImage src={user.avatar_url} alt={user.full_name} />
                                                    <AvatarFallback>{user.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.full_name || 'N/A'}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                                        </TableCell>
                                         <TableCell>
                                            {format(new Date(user.created_at), 'PPP')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => makeAdmin(user.id)} disabled={user.role === 'admin'}>
                                                        <UserCog className="mr-2 size-4" />
                                                        Make Admin
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
