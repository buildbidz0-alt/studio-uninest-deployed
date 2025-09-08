import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CreatePostForm() {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src="https://picsum.photos/id/237/40/40" alt="Your avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="w-full space-y-2">
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[80px] w-full resize-none border-0 px-0 shadow-none focus-visible:ring-0"
            />
            <div className="flex justify-end">
              <Button>Post</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
