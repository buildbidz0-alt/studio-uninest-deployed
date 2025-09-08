import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import NoteUploadForm from '@/components/notes/note-upload-form';
import NoteCard from '@/components/notes/note-card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notes Hub | Student Hub',
  description: 'Upload, share, and find study notes.',
};

const notes = [
  {
    id: 1,
    title: 'Introduction to Psychology - Chapter 1 Notes',
    author: 'Alice Johnson',
    subject: 'Psychology',
    tags: ['psychology', 'intro', 'chapter 1', 'memory'],
  },
  {
    id: 2,
    title: 'Calculus II - Full Semester Summary',
    author: 'Bob Williams',
    subject: 'Mathematics',
    tags: ['calculus', 'math', 'summary', 'integrals'],
  },
  {
    id: 3,
    title: 'CHEM-101 Midterm Study Guide',
    author: 'Charlie Brown',
    subject: 'Chemistry',
    tags: ['chemistry', 'midterm', 'study guide', 'organic'],
  },
];

export default function NotesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notes Hub</h1>
        <p className="text-muted-foreground">Upload your notes and discover resources from your peers.</p>
      </div>

      <NoteUploadForm />

      <div>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">Discover Notes</h2>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by course, topic, or keyword..." className="pl-10" />
        </div>
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>
    </div>
  );
}
