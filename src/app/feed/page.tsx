
'use client';

import { useState } from 'react';
import CreatePostForm from '@/components/feed/create-post-form';
import PostCard, { type Post } from '@/components/feed/post-card';
import type { Metadata } from 'next';

// Note: This is a temporary solution for metadata in a client component.
// For a production app, you might handle metadata differently.
// export const metadata: Metadata = {
//   title: 'Social Feed | Uninest',
//   description: 'Connect with your peers and share updates.',
// };


export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  const addPost = (content: string) => {
    const newPost: Post = {
      id: Date.now(),
      author: 'Guest User',
      handle: 'guest',
      avatarUrl: 'https://picsum.photos/id/237/40/40',
      content,
      likes: 0,
      comments: [],
      timestamp: 'Just now',
    };
    setPosts([newPost, ...posts]);
  };

  const deletePost = (id: number) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const editPost = (id: number, newContent: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, content: newContent } : p));
  };

  const addComment = (postId: number, commentContent: string) => {
    const newComment = {
      id: Date.now(),
      author: 'Guest User',
      handle: 'guest',
      avatarUrl: 'https://picsum.photos/id/237/40/40',
      content: commentContent,
    };
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, comments: [newComment, ...p.comments] } 
        : p
    ));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Social Feed</h1>
      <div className="space-y-8">
        <CreatePostForm onPost={addPost} />
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={deletePost}
                onEdit={editPost}
                onComment={addComment}
              />
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
