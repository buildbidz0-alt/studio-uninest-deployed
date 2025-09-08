import CreatePostForm from '@/components/feed/create-post-form';
import PostCard from '@/components/feed/post-card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Feed | Uninest',
  description: 'Connect with your peers and share updates.',
};

const posts = [
  {
    id: 1,
    author: 'Jane Doe',
    handle: 'janedoe',
    avatarUrl: 'https://picsum.photos/id/1027/48/48',
    content: 'Just finished my mid-term exams! 🥳 So glad to have some free time now. Anyone up for a study group for the finals next month? #studentlife #examsdone',
    likes: 128,
    comments: 12,
    timestamp: '2h ago',
  },
  {
    id: 2,
    author: 'John Smith',
    handle: 'johnsmith',
    avatarUrl: 'https://picsum.photos/id/1005/48/48',
    content: 'Found this amazing resource for quantum physics. It explains everything so clearly! Sharing the link in case anyone else is struggling with PHYS-301. DM for details!',
    likes: 92,
    comments: 5,
    timestamp: '5h ago',
  },
  {
    id: 3,
    author: 'Emily White',
    handle: 'emilywhite',
    avatarUrl: 'https://picsum.photos/id/3/48/48',
    content: 'Selling my barely used "Introduction to Algorithms" textbook, 3rd edition. Perfect condition. Check it out on the marketplace! #textbooks #marketplace',
    likes: 45,
    comments: 8,
    timestamp: '1d ago',
  }
];

export default function FeedPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Social Feed</h1>
      <div className="space-y-8">
        <CreatePostForm />
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
