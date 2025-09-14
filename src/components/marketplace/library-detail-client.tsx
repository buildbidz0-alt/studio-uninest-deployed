
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, MapPin, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Product } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

type LibraryDetailClientProps = {
    library: Product;
    initialOrders: any[];
    currentUser: User | null;
}

export default function LibraryDetailClient({ library, currentUser }: LibraryDetailClientProps) {
    const { supabase } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

     const handleChat = useCallback(async () => {
        if (!currentUser || !supabase) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to chat.' });
            return;
        }
        if (currentUser.id === library.seller_id) {
            toast({ variant: 'destructive', title: 'Error', description: 'You cannot start a chat with yourself.' });
            return;
        }

        try {
            const { data: existingRoom, error: findRoomError } = await supabase
                .rpc('get_mutual_private_room', { p_user1_id: currentUser.id, p_user2_id: library.seller_id });

            if (findRoomError) throw findRoomError;

            if (existingRoom && existingRoom.length > 0) {
                router.push('/chat');
                return;
            }

            const { data: newRoom, error: newRoomError } = await supabase
                .from('chat_rooms')
                .insert({ is_private: true }).select('id').single();
            
            if (newRoomError) throw newRoomError;

            const { error: participantsError } = await supabase
                .from('chat_room_participants')
                .insert([
                    { room_id: newRoom.id, user_id: currentUser.id },
                    { room_id: newRoom.id, user_id: library.seller_id },
                ]);

            if (participantsError) throw participantsError;
            
            router.push('/chat');
        } catch (error) {
            console.error('Error starting chat session:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not start chat session.' });
        }
    }, [currentUser, supabase, toast, router, library.seller_id]);


    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                     <Card className="overflow-hidden">
                        <div className="relative aspect-video">
                            <Image
                                src={library.image_url || 'https://picsum.photos/seed/library-detail/800/600'}
                                alt={library.name}
                                fill
                                className="object-cover"
                                data-ai-hint="library interior books"
                            />
                        </div>
                    </Card>
                    <Card className="bg-muted/50">
                        <CardContent className="p-4">
                             <Link href={`/profile/${library.seller.handle}`} className="flex items-center gap-4">
                                <Avatar className="size-12">
                                    <AvatarImage src={library.seller.avatar_url || undefined} />
                                    <AvatarFallback>{library.seller.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm text-muted-foreground">Managed by</p>
                                    <p className="font-bold text-lg">{library.seller.full_name}</p>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h1 className="text-3xl lg:text-4xl font-bold font-headline">{library.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-5" />
                        <span className="font-semibold text-foreground">{library.location || 'Location not specified'}</span>
                    </div>
                    
                    <p className="text-muted-foreground">{library.description}</p>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Ready to Study?</CardTitle>
                            <CardDescription>All library seat bookings are now handled through our central booking system for a unified experience.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button size="lg" className="w-full" asChild>
                                <Link href="/booking">
                                    Go to Seat Booking <ArrowRight className="ml-2 size-5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col sm:flex-row gap-4">
                         <Button size="lg" variant="outline" className="flex-1 text-lg" onClick={handleChat}>
                            <MessageSquare className="mr-2" />
                            Chat with Manager
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
