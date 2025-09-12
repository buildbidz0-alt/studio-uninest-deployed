
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { tagNote } from '@/ai/flows/tag-note-flow';
import type { Note } from '@/lib/types';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z.string().optional(),
  file: z.instanceof(File).refine(file => file.size > 0, 'A file is required.'),
});

type UploadNoteFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteUploaded: (note: Note) => void;
};

export default function UploadNoteForm({ isOpen, onOpenChange, onNoteUploaded }: UploadNoteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const { user, supabase } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const file = form.watch('file');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    form.setValue('file', file);
    setIsTagging(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const fileDataUri = reader.result as string;
        const result = await tagNote({ fileDataUri, fileName: file.name });
        setTags(result.tags);
      };
    } catch (error) {
      console.error('AI tagging failed:', error);
      toast({ variant: 'destructive', title: 'AI Tagging Failed', description: 'Could not generate tags for this file.' });
    } finally {
      setIsTagging(false);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const newTag = event.currentTarget.value.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        event.currentTarget.value = '';
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !supabase) return;
    setIsLoading(true);

    const file = values.file;
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('notes')
      .upload(filePath, file);

    if (uploadError) {
      toast({ variant: 'destructive', title: 'Upload Error', description: uploadError.message });
      setIsLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('notes')
      .getPublicUrl(filePath);

    const { data: newNote, error: dbError } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: values.title,
        description: values.description,
        file_url: publicUrl,
        file_type: file.type,
        tags,
      })
      .select('*, profiles:user_id(full_name, avatar_url)')
      .single();

    if (dbError) {
      toast({ variant: 'destructive', title: 'Database Error', description: dbError.message });
    } else {
      toast({ title: 'Note Uploaded!', description: 'Your note is now available to the community.' });
      onNoteUploaded(newNote as Note);
      onOpenChange(false);
      form.reset();
      setTags([]);
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a New Note</DialogTitle>
          <DialogDescription>
            Share your knowledge with the community. Your file will be analyzed by AI to suggest relevant tags.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quantum Mechanics Lecture 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What's this note about? Any key topics?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input type="file" onChange={handleFileChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {file && (
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-500" />
                  Suggested Tags
                </FormLabel>
                <div className="flex flex-wrap gap-2 p-2 border rounded-lg min-h-[40px]">
                  {isTagging && <Loader2 className="animate-spin size-4 text-muted-foreground" />}
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => handleTagRemove(tag)} className="rounded-full hover:bg-black/20">
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                   <Input 
                      className="h-auto flex-1 border-none shadow-none focus-visible:ring-0 p-0 m-0"
                      placeholder="Add a tag..."
                      onKeyDown={handleAddTag}
                    />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isTagging}>
                {(isLoading || isTagging) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Uploading...' : isTagging ? 'Analyzing...' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
