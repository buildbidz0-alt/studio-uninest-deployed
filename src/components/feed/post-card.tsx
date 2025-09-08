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

export type Post = {
  id: number;
  author: string;
  handle: string;
  avatarUrl: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
};

type PostCardProps = {
  post: Post;
};

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.comments);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleComment = () => {
    // For now, we'll just increment the comment count.
    setCommentCount(commentCount + 1);
  };

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
             <p className="text-sm text-muted-foreground">{post.timestamp}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8">
                <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-4 pb-2 pt-0">
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-start gap-4 p-4 pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-muted-foreground"
          onClick={handleLike}
        >
          <Heart className={`size-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          <span>{likeCount}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-muted-foreground"
          onClick={handleComment}
        >
          <MessageCircle className="size-4" />
          <span>{commentCount}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
