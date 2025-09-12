import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import StudyHubContent from '@/components/notes/study-hub-content';
import type { Note } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Study Hub – AI-Powered Note Sharing',
  description: 'Upload, share, and discover study notes. Our AI automatically tags your documents to make them easily searchable for everyone on campus.',
};

export default async function NotesPage() {
  const supabase = createClient();

  const { data: notes, error } = await supabase
    .from('notes')
    .select('*, profiles:user_id(full_name, avatar_url)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    // You might want to handle this error more gracefully
  }

  return <StudyHubContent initialNotes={(notes as Note[]) || []} />;
}
