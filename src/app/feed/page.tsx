
import CreatePostForm from '@/components/feed/create-post-form';
import PostCard from '@/components/feed/post-card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Feed | Uninest',
  description: 'Connect with your peers and share updates.',
};

const posts: any[] = [];

export default function FeedPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Social Feed</h1>
      <div className="space-y-8">
        <CreatePostForm />
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <h2 className="text-xl font-semibold">No posts yet</h2>
              <p>Be the first to share something with the community!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
