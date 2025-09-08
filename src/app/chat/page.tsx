
import type { Metadata } from 'next';
import ChatLayout from '@/components/chat/chat-layout';

export const metadata: Metadata = {
  title: 'My Messages | UniNest',
  description: 'Chat with vendors and other users directly on UniNest.',
};

// TODO: Fetch initial chat rooms for the logged-in user from your backend API
// Example: const initialRooms = await fetch('/api/chat/rooms').then(res => res.json());
const initialRooms: any[] = [
    { id: '1', name: 'Campus Bookseller', lastMessage: 'Sure, it is available.', unreadCount: 1, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: '2', name: 'Mess Services', lastMessage: 'Your subscription is confirmed.', unreadCount: 0, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: '3', name: 'PG Accommodations', lastMessage: 'Yes, a single room is available from next month.', unreadCount: 0, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

// TODO: Fetch initial messages for the first chat room (or leave it to the client)
const initialMessages: any[] = [
    { id: 'm1', sender: 'Campus Bookseller', text: 'Hi there! How can I help you today?', timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString() },
    { id: 'm2', sender: 'You', text: 'Hello, I was asking about the "Intro to AI" textbook.', timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString() },
    { id: 'm3', sender: 'Campus Bookseller', text: 'Sure, it is available.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
];

export default function ChatPage() {
  return <ChatLayout initialRooms={initialRooms} initialMessages={initialMessages} />;
}
