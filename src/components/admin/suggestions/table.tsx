
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { updateSuggestionStatus } from '@/app/admin/suggestions/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ThumbsUp, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Suggestion = {
    id: number;
    created_at: string;
    title: string;
    description: string;
    deadline: string | null;
    contact: string | null;
    status: string;
    profiles: {
        full_name: string;
        avatar_url: string;
    } | null;
}

type SuggestionsTableProps = {
    initialSuggestions: Suggestion[];
    error?: string;
}

export default function SuggestionsTable({ initialSuggestions, error }: SuggestionsTableProps) {
    const { toast } = useToast();
    const [suggestions, setSuggestions] = useState(initialSuggestions);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
        setUpdatingId(id);
        const result = await updateSuggestionStatus(id, status);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Suggestion status updated.' });
            setSuggestions(suggestions.map(s => s.id === id ? { ...s, status } : s));
        }
        setUpdatingId(null);
    };

    if (error) {
        return (
             <Alert variant="destructive">
                <AlertTitle>Error loading suggestions</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge variant="default" className="bg-green-600">Approved</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge variant="secondary">Pending</Badge>;
        }
    }

    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Submitted On</TableHead>
                            <TableHead>Submitted By</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!suggestions || suggestions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No suggestions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            suggestions.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{format(new Date(item.created_at), 'PPP')}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="size-7">
                                                <AvatarImage src={(item.profiles as any)?.avatar_url} />
                                                <AvatarFallback>{(item.profiles as any)?.full_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            {(item.profiles as any)?.full_name || 'Anonymous'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-muted-foreground truncate max-w-sm">{item.description}</p>
                                    </TableCell>
                                     <TableCell>{getStatusBadge(item.status)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {updatingId === item.id ? (
                                            <Loader2 className="size-5 animate-spin inline-flex" />
                                        ) : item.status === 'pending' ? (
                                            <>
                                                <Button size="icon" variant="outline" className="text-green-500" onClick={() => handleStatusUpdate(item.id, 'approved')}><ThumbsUp /></Button>
                                                <Button size="icon" variant="outline" className="text-red-500" onClick={() => handleStatusUpdate(item.id, 'rejected')}><X /></Button>
                                            </>
                                        ) : null}
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
