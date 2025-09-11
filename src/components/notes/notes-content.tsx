'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Search, UploadCloud } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Note } from '@/lib/types';
import { tagNote } from '@/ai/flows/tag-note-flow';
import NoteCard from './note-card';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
  file: z.instanceof(File).refine(file => file.size > 0, 'A file is required.'),
});

export default function NotesContent() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, supabase } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '' },
  });

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*, profiles(full_name, avatar_url)')
        .order('created_at', { ascending: false });

      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch notes.' });
      } else {
        setNotes(data as Note[]);
      }
      setLoading(false);
    };
    fetchNotes();
  }, [supabase, toast]);

  const readFileAsDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not logged in', description: 'You must be logged in to upload notes.' });
      return;
    }
    setIsUploading(true);

    // 1. Upload file to Supabase Storage
    const file = values.file;
    const filePath = `public/${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('notes')
      .upload(filePath, file);

    if (uploadError) {
      toast({ variant: 'destructive', title: 'Upload Error', description: uploadError.message });
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('notes').getPublicUrl(filePath);

    // 2. (In parallel) Get AI tags for the note
    let tags: string[] = [];
    try {
      const fileDataUri = await readFileAsDataURI(file);
      const result = await tagNote({ fileDataUri, fileName: file.name });
      tags = result.tags;
      toast({ title: 'AI Magic', description: `Suggested tags: ${tags.join(', ')}` });
    } catch (aiError) {
      console.error('AI tagging failed:', aiError);
      toast({ variant: 'destructive', title: 'AI Tagging Failed', description: 'Could not generate tags, but the note will still be uploaded.' });
    }
    
    // 3. Insert note metadata into the database
    const { data: newNote, error: dbError } = await supabase
        .from('notes')
        .insert({
            user_id: user.id,
            title: values.title,
            description: values.description,
            file_url: publicUrl,
            file_type: file.type,
            tags: tags,
        })
        .select('*, profiles(full_name, avatar_url)')
        .single();
    
    if (dbError) {
        toast({ variant: 'destructive', title: 'Database Error', description: dbError.message });
    } else if (newNote) {
        setNotes([newNote as Note, ...notes]);
        toast({ title: 'Success!', description: 'Your note has been uploaded.' });
        form.reset();
        setIsDialogOpen(false);
    }
    setIsUploading(false);
  };
  
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const lowercasedQuery = searchQuery.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowercasedQuery) ||
      (note.description && note.description.toLowerCase().includes(lowercasedQuery)) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery)))
    );
  }, [notes, searchQuery]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Notes Hub</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Find and share study materials from your peers.
            </p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search notes by title, tag..." 
                    className="pl-10 w-full md:w-80" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button disabled={!user}>
                <PlusCircle className="mr-2" /> Upload Note
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Upload a New Note</DialogTitle>
                <DialogDescription>
                    Share your study materials with the community. Our AI will automatically suggest tags for you.
                </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Quantum Physics Lecture 1" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="A brief summary of the notes." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="file" render={({ field: { onChange, ...fieldProps } }) => (
                        <FormItem><FormLabel>File</FormLabel><FormControl><Input type="file" accept="application/pdf, image/*" onChange={(e) => onChange(e.target.files?.[0])} {...fieldProps} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 animate-spin" /> : <UploadCloud className="mr-2" />}
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </form>
                </Form>
            </DialogContent>
            </Dialog>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.map(note => <NoteCard key={note.id} note={note} />)}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">
            <h2 className="text-xl font-semibold">No Notes Found</h2>
            <p>Be the first to upload and share study materials!</p>
        </div>
      )}
    </div>
  );
}
