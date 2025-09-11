import type { Metadata } from 'next';
import { BookOpen, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Study Hub | Coming Soon!',
  description: 'The Study Hub is under construction. Get ready for AI-powered note sharing!',
};

export default function NotesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <div className="relative mb-6">
            <BookOpen className="size-24 text-primary/30" />
            <Sparkles className="absolute -top-2 -right-2 size-8 text-amber-400 animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Study Hub is Coming Soon!</h1>
        <p className="mt-4 max-w-md mx-auto text-lg text-muted-foreground">
            We're hard at work building an amazing space for you to share and discover notes. Get ready for AI-powered tagging and a seamless experience!
        </p>
    </div>
  );
}
