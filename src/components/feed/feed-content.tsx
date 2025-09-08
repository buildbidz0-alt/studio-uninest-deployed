
'use client';

import { useState, useEffect, useCallback } from 'react';
import CreatePostForm from '@/components/feed/create-post-form';
import PostCard from '@/components/feed/post-card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

// We need to define the full Post type including profile data
export type PostWithAuthor = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  likes: { count: number };
  comments: any[]; // Define a proper comment type later
  profiles: {
    full_name: string;
    avatar_url: string;
    handle: string;
  } | null;
  isLiked: boolean;
};

export default function FeedContent() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    // Fetch posts with author info, likes count, and comments
    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles ( full_name, avatar_url, handle ),
        likes ( count ),
        comments ( id, content, profiles (full_name, avatar_url, handle) )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching posts', description: error.message });
      setLoading(false);
      return;
    }

    if (user) {
        const { data: likedPosts, error: likedError } = await supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', user.id);

        if (likedPosts) {
            const likedPostIds = new Set(likedPosts.map(p => p.post_id));
            const postsWithLikes = postsData.map(p => ({
                ...p,
                isLiked: likedPostIds.has(p.id),
            }));
            setPosts(postsWithLikes);
        } else {
            setPosts(postsData.map(p => ({ ...p, isLiked: false })));
        }

    } else {
        setPosts(postsData.map(p => ({ ...p, isLiked: false })));
    }
    
    setLoading(false);
  }, [supabase, toast, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const addPost = async (content: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to post.' });
      return;
    }

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert({ content, user_id: user.id })
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles ( full_name, avatar_url, handle ),
        likes ( count ),
        comments ( id, content, profiles (full_name, avatar_url, handle) )
      `)
      .single();

    if (error) {
      toast({ variant: 'destructive', title: 'Error creating post', description: error.message });
    } else if (newPost) {
      setPosts([ { ...newPost, isLiked: false }, ...posts]);
      toast({ title: 'Post created successfully!' });
    }
  };

  const deletePost = async (id: number) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error deleting post', description: error.message });
    } else {
      setPosts(posts.filter(p => p.id !== id));
      toast({ title: 'Post Deleted', description: 'Your post has been successfully removed.' });
    }
  };

  const editPost = async (id: number, newContent: string) => {
    const { data: updatedPost, error } = await supabase
        .from('posts')
        .update({ content: newContent })
        .eq('id', id)
        .select()
        .single();
    
    if (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Could not update the post.' });
    } else {
       setPosts(posts.map(p => p.id === id ? { ...p, content: updatedPost.content } : p));
       toast({ title: 'Post Updated', description: 'Your post has been successfully updated.' });
    }
  };

  const addComment = async (postId: number, commentContent: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to comment.' });
      return;
    }
    
    const { data: newComment, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: user.id, content: commentContent})
        .select('*, profiles (full_name, avatar_url, handle)')
        .single();

    if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not add comment.' });
    } else {
        setPosts(posts.map(p => p.id === postId ? { ...p, comments: [newComment, ...p.comments]} : p));
    }
  };
  
  const updateLikes = async (postId: number, isLiked: boolean) => {
     if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to like posts.' });
        return;
    }

    if (isLiked) {
        // Unlike the post
        const { error } = await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
         if (error) {
            toast({ variant: 'destructive', title: 'Error', description: "Could not unlike the post." });
        } else {
            setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: false, likes: { count: (p.likes?.count || 1) - 1 } } : p));
        }
    } else {
        // Like the post
        const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: "Could not like the post." });
        } else {
            setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: true, likes: { count: (p.likes?.count || 0) + 1 } } : p));
        }
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Social Feed</h1>
      <div className="space-y-8">
        <CreatePostForm onPost={addPost} />
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length > 0 ? (
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

