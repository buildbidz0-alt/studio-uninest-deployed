
import type { Metadata } from 'next';
import FeedContent from '@/components/feed/feed-content';

export const metadata: Metadata = {
  title: 'Student Social Feed – Connect, Post, Like, and Comment',
  description: 'Join the conversation on the UniNest student social feed. Connect with peers, share updates, and stay engaged with your campus community.',
};

export default function FeedPage() {
  return <FeedContent />;
}
