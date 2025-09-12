
'use client';

import type { Metadata } from 'next';
import FeedContent from '@/components/feed/feed-content';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// We can't export metadata from a client component.
// export const metadata: Metadata = {
//   title: 'Student Social Feed – Connect, Post, Like, and Comment',
//   description: 'Join the conversation on the UniNest student social feed. Connect with peers, share updates, and stay engaged with your campus community.',
// };

export default function FeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleCreatePostClick = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to create a post.',
        action: <Button onClick={() => router.push('/login')}>Login</Button>
      });
    } else {
      const createPostElement = document.getElementById('create-post');
      if (createPostElement) {
        createPostElement.scrollIntoView({ behavior: 'smooth' });
        const textarea = createPostElement.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }
    }
  };

  return (
    <>
      <FeedContent />
      <Button 
        onClick={handleCreatePostClick}
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-40 h-16 w-16 rounded-full shadow-lg"
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">Create Post</span>
      </Button>
    </>
  );
}
