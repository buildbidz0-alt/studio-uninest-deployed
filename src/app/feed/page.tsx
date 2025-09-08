
'use client';

import { useState, useEffect } from 'react';
import CreatePostForm from '@/components/feed/create-post-form';
import PostCard, { type Post } from '@/components/feed/post-card';
import type { Metadata } from 'next';

// Note: This is a temporary solution for metadata in a client component.
// For a production app, you might handle metadata differently.
// export const metadata: Metadata = {
//   title: 'Social Feed | Uninest',
//   description: 'Connect with your peers and share updates.',
// };

function FeedContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedPosts = localStorage.getItem('uninest-posts');
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      }
    } catch (error) {
      console.error("Failed to parse posts from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('uninest-posts', JSON.stringify(posts));
    }
  }, [posts, isMounted]);

  const addPost = (content: string) => {
    const newPost: Post = {
      id: Date.now(),
      author: 'Guest User',
      handle: 'guest',
      avatarUrl: 'https://picsum.photos/id/237/40/40',
      content,
      likes: 0,
      comments: [],
      timestamp: new Date().toLocaleString(),
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
  
  const updateLikes = (postId: number, newLikeCount: number) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: newLikeCount } : p));
  }

  if (!isMounted) {
    return null; // or a loading spinner
  }

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
                onLike={updateLikes}
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

const FeedPage = () => {
  return <FeedContent />;
}

export const metadata: Metadata = {
  title: 'Student Social Feed – Connect, Post, Like, and Comment',
  description: 'Join the conversation on the UniNest student social feed. Connect with peers, share updates, and stay engaged with your campus community.',
};

export default FeedPage;
