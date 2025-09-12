
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Frown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Note } from '@/lib/types';
import NoteCard from './note-card';
import UploadNoteForm from './upload-note-form';

type StudyHubContentProps = {
  initialNotes: Note[];
};

export default function StudyHubContent({ initialNotes }: StudyHubContentProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleNoteUploaded = (newNote: Note) => {
    setNotes([newNote, ...notes]);
  };

  return (
    <>
      <div className="space-y-8">
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Study Hub</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Share your knowledge and discover notes from peers.
            </p>
          </div>
          {user && (
            <Button onClick={() => setIsUploadOpen(true)}>
              <PlusCircle className="mr-2 size-4" />
              Upload Note
            </Button>
          )}
        </section>

        <section>
          {notes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notes.map(note => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-400px)] text-center bg-card p-8 rounded-2xl">
              <Frown className="size-16 text-muted-foreground" />
              <h2 className="mt-4 text-2xl font-bold">No Notes Found</h2>
              <p className="text-muted-foreground">Be the first to upload a note and help out the community!</p>
            </div>
          )}
        </section>
      </div>

      {user && (
        <UploadNoteForm
          isOpen={isUploadOpen}
          onOpenChange={setIsUploadOpen}
          onNoteUploaded={handleNoteUploaded}
        />
      )}
    </>
  );
}
