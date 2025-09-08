
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

type Comment = {
  id: number;
  author: string;
  handle: string;
  avatarUrl: string;
  content: string;
};

export type Post = {
  id: number;
  author: string;
  handle: string;
  avatarUrl: string;
  content: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
};

type PostCardProps = {
  post: Post;
  onDelete: (id: number) => void;
  onEdit: (id: number, newContent: string) => void;
  onComment: (postId: number, commentContent: string) => void;
  onLike: (postId: number, newLikeCount: number) => void;
};

export default function PostCard({ post, onDelete, onEdit, onComment, onLike }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    if (!user) return;
    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);
    onLike(post.id, newLikeCount);
  };

  const handleSaveEdit = () => {
    onEdit(post.id, editedContent);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
    }
  }

  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Avatar>
          <AvatarImage src={post.avatarUrl} alt={`${post.author}'s avatar`} data-ai-hint="person face" />
          <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{post.author}</p>
              <p className="text-sm text-muted-foreground">@{post.handle}</p>
            </div>
             <p className="text-sm text-muted-foreground">{new Date(post.timestamp).toLocaleString()}</p>
          </div>
        </div>
        {user && (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8">
                    <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setIsEditing(true); setEditedContent(post.content); }}>
                  <Edit className="mr-2 size-4" />
                  Edit
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your post from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(post.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-2 pt-0">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea 
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        )}
      </CardContent>
      {!isEditing && (
        <CardFooter className="flex flex-col items-start gap-2 p-4 pt-2">
            <div className='flex items-center justify-start gap-4'>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-2 text-muted-foreground"
                    onClick={handleLike}
                    disabled={!user}
                >
                    <Heart className={`size-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{likeCount}</span>
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
                              <AvatarImage src="https://picsum.photos/id/237/40/40" alt="Your avatar" />
                              <AvatarFallback>U</AvatarFallback>
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
                         <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link> to join the conversation.
                      </p>
                    )}
                    {post.comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-2">
                             <Avatar className="size-8">
                                <AvatarImage src={comment.avatarUrl} alt={`${comment.author}'s avatar`} data-ai-hint="person face"/>
                                <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 rounded-lg bg-muted px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm">{comment.author}</p>
                                    <p className="text-xs text-muted-foreground">@{comment.handle}</p>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardFooter>
      )}
    </Card>
  );
}
