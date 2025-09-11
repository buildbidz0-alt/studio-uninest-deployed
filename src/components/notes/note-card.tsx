import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Download, FileText, ImageIcon } from 'lucide-react';
import type { Note } from '@/lib/types';

type NoteCardProps = {
  note: Note;
};

const NoteIcon = ({ fileType }: { fileType: string }) => {
  if (fileType.startsWith('image/')) {
    return <ImageIcon className="size-4 text-muted-foreground" />;
  }
  if (fileType === 'application/pdf') {
    return <FileText className="size-4 text-muted-foreground" />;
  }
  return <FileText className="size-4 text-muted-foreground" />;
};

export default function NoteCard({ note }: NoteCardProps) {
  const author = note.profiles;
  const authorName = author?.full_name || 'Anonymous';
  const authorAvatar = author?.avatar_url || 'https://picsum.photos/seed/anon/40';

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={authorAvatar} alt={authorName} data-ai-hint="person face" />
            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{authorName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <CardTitle className="pt-2 text-lg">{note.title}</CardTitle>
        {note.description && <CardDescription>{note.description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center gap-2">
            <NoteIcon fileType={note.file_type} />
            <span className="text-sm text-muted-foreground">{note.file_type}</span>
        </div>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href={note.file_url} target="_blank" download>
            <Download className="mr-2 size-4" />
            Download
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
