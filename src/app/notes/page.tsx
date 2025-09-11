import type { Metadata } from 'next';
import NotesContent from '@/components/notes/notes-content';

export const metadata: Metadata = {
  title: 'Notes Hub | Uninest',
  description: 'Upload, share, and find study notes with AI-powered tagging.',
};

export default function NotesPage() {
  return <NotesContent />;
}
