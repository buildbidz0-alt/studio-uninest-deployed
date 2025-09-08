import { PenTool } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notes Hub | Uninest',
  description: 'Upload, share, and find study notes.',
};

export default function NotesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <div className="bg-primary text-primary-foreground rounded-full p-6 mb-6">
        <PenTool className="size-12" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-primary">Coming Soon</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        We're hard at work building an incredible Notes Hub for you. Soon, you'll be able to upload, tag, and discover study materials like never before. Stay tuned!
      </p>
    </div>
  );
}
