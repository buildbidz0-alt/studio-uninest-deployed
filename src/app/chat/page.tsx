
'use client';

import { Suspense } from 'react';
import AIChatView from '@/components/chat/ai-chat-view';
import { Loader2 } from 'lucide-react';

function ChatPageContent() {
    return <AIChatView />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary size-8" /></div>}>
        <ChatPageContent />
    </Suspense>
  );
}
