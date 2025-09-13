
'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type TicketStatusChangerProps = {
    ticketId: number;
    currentStatus: string;
};

const statusColors: { [key: string]: string } = {
    'Open': 'bg-blue-500',
    'In Progress': 'bg-yellow-500',
    'Closed': 'bg-green-500',
    'Archived': 'bg-gray-500',
};

export default function TicketStatusChanger({ ticketId, currentStatus }: TicketStatusChangerProps) {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const { supabase } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleStatusChange = async (newStatus: string) => {
        if (!supabase) return;
        setIsUpdating(true);
        setStatus(newStatus);
        
        const { error } = await supabase
            .from('support_tickets')
            .update({ status: newStatus })
            .eq('id', ticketId);

        setIsUpdating(false);
        
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update ticket status.' });
            setStatus(currentStatus); // Revert on error
        } else {
            toast({ title: 'Status Updated', description: `Ticket #${ticketId} is now "${newStatus}".` });
            router.refresh();
        }
    };

    return (
        <Select onValueChange={handleStatusChange} value={status} disabled={isUpdating}>
            <SelectTrigger className={cn(
                "w-36 text-white border-0",
                statusColors[status] || 'bg-gray-500'
            )}>
                <SelectValue placeholder="Set status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
        </Select>
    );
}
