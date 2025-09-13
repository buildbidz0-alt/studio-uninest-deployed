
'use client';

import ChatLayout from '@/components/chat/chat-layout';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function VendorChatPageContent() {
    return <ChatLayout />;
}

// This page is a wrapper to provide a vendor-specific route for the chat layout.
export default function VendorChatPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary size-8" /></div>}>
        <VendorChatPageContent />
    </Suspense>
  );
}
