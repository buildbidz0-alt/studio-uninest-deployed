
import type { Metadata } from 'next';
import ChatLayout from '@/components/chat/chat-layout';

export const metadata: Metadata = {
  title: 'My Messages | UniNest',
  description: 'Chat with vendors and other users directly on UniNest.',
};

// TODO: Fetch initial chat rooms for the logged-in user from your backend API
// Example: const initialRooms = await fetch('/api/chat/rooms').then(res => res.json());
const initialRooms: any[] = [];

// TODO: Fetch initial messages for the first chat room (or leave it to the client)
const initialMessages: any[] = [];

export default function ChatPage() {
  return <ChatLayout initialRooms={initialRooms} initialMessages={initialMessages} />;
}
