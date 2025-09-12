
import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Study Hub | UniNest',
  description: 'The Study Hub is coming soon! Get ready to share and discover notes like never before.',
};

export default function NotesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <div className="p-6 bg-primary/10 rounded-full mb-6">
        <BookOpen className="size-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold font-headline text-primary">Coming Soon!</h1>
      <p className="mt-2 text-lg text-muted-foreground max-w-md">
        The Study Hub is under construction. Get ready to upload, share, and discover notes with AI-powered tagging!
      </p>
    </div>
  );
}
