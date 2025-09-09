
'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { Label } from '../ui/label';
import { formatDistanceToNow } from 'date-fns';
import { PostWithAuthor } from './feed-content';

type Comment = {
  id: number;
  content: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    handle: string;
  }
};

type PostCardProps = {
  post: PostWithAuthor;
  onDelete: (id: number) => void;
  onEdit: (id: number, newContent: string) => void;
  onComment: (postId: number, commentContent: string) => void;
  onLike: (postId: number, isLiked: boolean) => void;
};

export default function PostCard({ post, onDelete, onEdit, onComment, onLike }: PostCardProps) {
  const { user, role } = useAuth();
  const [editedContent, setEditedContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const isAuthor = user?.id === post.user_id;
  const isAdmin = role === 'admin';
  const canEditOrDelete = isAuthor || isAdmin;

  const handleLike = () => {
    onLike(post.id, post.isLiked);
  };

  const handleSaveEdit = () => {
    onEdit(post.id, editedContent);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
    }
  }

  const getFormattedTimestamp = () => {
    try {
      return formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
    } catch (e) {
      return post.created_at;
    }
  }

  const authorName = post.profiles?.full_name || 'Anonymous User';
  const authorHandle = post.profiles?.handle || 'anonymous';
  const authorAvatar = post.profiles?.avatar_url || 'https://picsum.photos/seed/anon/40/40';

  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Avatar>
          <AvatarImage src={authorAvatar} alt={`${authorName}'s avatar`} data-ai-hint="person face" />
          <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{authorName}</p>
              <p className="text-sm text-muted-foreground">@{authorHandle}</p>
            </div>
             <p className="text-sm text-muted-foreground">{getFormattedTimestamp()}</p>
          </div>
        </div>
        {canEditOrDelete && (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8">
                    <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 size-4" />
                    Edit
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(post.id)}>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit Post</AlertDialogTitle>
                <AlertDialogDescription>
                  Make changes to your post. Click save when you're done.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="edit-post" className="sr-only">Edit Post</Label>
                <Textarea 
                  id="edit-post"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSaveEdit}>Save</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-2 pt-0">
          <p className="whitespace-pre-wrap text-sm">{post.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-4 pt-2">
          <div className='flex items-center justify-start gap-4'>
              <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 text-muted-foreground"
                  onClick={handleLike}
                  disabled={!user}
              >
                  <Heart className={`size-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{post.likes?.length || 0}</span>
              </Button>
              <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 text-muted-foreground"
                  onClick={() => setShowComments(!showComments)}
              >
                  <MessageCircle className="size-4" />
                  <span>{post.comments.length}</span>
              </Button>
          </div>
          {showComments && (
              <div className='w-full pt-4 space-y-4'>
                  <Separator />
                  {user ? (
                    <div className="flex items-start gap-2">
                        <Avatar className="size-8">
                            <AvatarImage src={user.user_metadata?.avatar_url || 'https://picsum.photos/id/237/40/40'} alt="Your avatar" />
                            <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="w-full space-y-2">
                              <Textarea
                                placeholder="Write a comment..."
                                className="min-h-[60px] w-full resize-none"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>Reply</Button>
                            </div>
                        </div>
                    </div>
                  ) : (
                     <p className="text-sm text-muted-foreground text-center">
                       <a href="/login" className="text-primary font-semibold hover:underline">Log in</a> to join the conversation.
                    </p>
                  )}
                  {post.comments.map((comment: Comment) => (
                      <div key={comment.id} className="flex items-start gap-2">
                           <Avatar className="size-8">
                              <AvatarImage src={comment.profiles.avatar_url} alt={`${comment.profiles.full_name}'s avatar`} data-ai-hint="person face"/>
                              <AvatarFallback>{comment.profiles.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 rounded-lg bg-muted px-3 py-2">
                              <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm">{comment.profiles.full_name}</p>
                                  <p className="text-xs text-muted-foreground">@{comment.profiles.handle}</p>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </CardFooter>
    </Card>
  );
}

// Remove the separate Post type as it's now replaced by PostWithAuthor
export type {};
