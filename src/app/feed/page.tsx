
import type { Metadata } from 'next';
import FeedContent from '@/components/feed/feed-content';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Student Social Feed – Connect, Post, Like, and Comment',
  description: 'Join the conversation on the UniNest student social feed. Connect with peers, share updates, and stay engaged with your campus community.',
};

export default function FeedPage() {
  return (
    <>
      <FeedContent />
      <Button asChild className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-40 h-16 w-16 rounded-full shadow-lg">
          <Link href="#create-post">
            <Plus className="h-8 w-8" />
          </Link>
      </Button>
    </>
  );
}
