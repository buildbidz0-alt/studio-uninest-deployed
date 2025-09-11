
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

type UserProfile = {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    role: string;
    created_at: string;
    // Add other fields as necessary, e.g., status
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const { supabase } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            // This assumes you have a 'profiles' table with user details
            const { data, error } = await supabase
                .from('profiles')
                .select('*');

            if (error) {
                console.error("Error fetching users:", error);
            } else {
                // We need to get the email from the auth.users table
                const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
                
                if (authError) {
                    console.error("Error fetching auth users:", authError);
                    setUsers(data as UserProfile[]); // Fallback to profiles data
                } else {
                    const usersWithEmail = data.map(profile => {
                        const authUser = authUsers.users.find(u => u.id === profile.id);
                        return {
                            ...profile,
                            email: authUser?.email || 'N/A',
                            created_at: authUser?.created_at || profile.created_at,
                            role: authUser?.user_metadata?.role || 'student',
                        }
                    })
                    setUsers(usersWithEmail as UserProfile[]);
                }
            }
            setLoading(false);
        };

        fetchUsers();
    }, [supabase]);

    return (
        <div className="space-y-8">
            <PageHeader title="User Management" description="View, ban, or unban users.">
                <Button>Add User</Button>
            </PageHeader>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        Loading users...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
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
                                        <TableCell>
                                            <Badge variant="secondary">Active</Badge> {/* TODO: Add status logic */}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">Edit</Button> {/* TODO: Add functionality */}
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
