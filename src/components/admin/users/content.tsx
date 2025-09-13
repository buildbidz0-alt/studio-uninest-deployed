
'use client';

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserCog } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { promoteUser } from "@/app/admin/users/actions";

export type UserProfile = {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    role: string;
    created_at: string;
};

type AdminUsersContentProps = {
    initialUsers: UserProfile[];
    initialError: string | null;
}

export default function AdminUsersContent({ initialUsers, initialError }: AdminUsersContentProps) {
    const [users, setUsers] = useState<UserProfile[]>(initialUsers);
    const { toast } = useToast();
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    const makeAdmin = async (userId: string) => {
        setUpdatingUserId(userId);
        const result = await promoteUser(userId);
        setUpdatingUserId(null);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'User promoted to admin successfully.' });
            setUsers(users.map(u => u.id === userId ? { ...u, role: 'admin' } : u));
        }
    }

    if (initialError) {
        return (
             <Alert variant="destructive">
                <AlertTitle>Error Fetching Users</AlertTitle>
                <AlertDescription>{initialError}</AlertDescription>
            </Alert>
        )
    }

    return (
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
                        {users.length === 0 ? (
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
                                                <AvatarImage src={user.avatar_url} alt={user.full_name} data-ai-hint="person face" />
                                                <AvatarFallback>{user.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.full_name || 'N/A'}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'vendor' ? 'secondary' : 'outline'}>{user.role}</Badge>
                                    </TableCell>
                                        <TableCell>
                                        {format(new Date(user.created_at), 'PPP')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {updatingUserId === user.id ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
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
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
