'use client';

import ChatLayout from '@/components/chat/chat-layout';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function ChatPageContent() {
    return <ChatLayout />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary size-8" /></div>}>
        <ChatPageContent />
    </Suspense>
  );
}
