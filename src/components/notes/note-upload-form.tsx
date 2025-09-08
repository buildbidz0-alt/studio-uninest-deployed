
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { uploadAndTagNote } from '@/app/notes/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

const initialState = {
  message: null,
  tags: [],
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </>
      ) : (
        <>
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload & Tag Note
        </>
      )}
    </Button>
  );
}

export default function NoteUploadForm() {
  const [state, formAction] = useFormState(uploadAndTagNote, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (state.message === 'success') {
      formRef.current?.reset();
    }
  }, [state.message]);


  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Upload New Note</CardTitle>
        <CardDescription>Our AI will automatically tag your document to make it easily searchable.</CardDescription>
      </CardHeader>
      <CardContent>
        {user ? (
          <>
            <form ref={formRef} action={formAction} className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="noteFile">Note Document</Label>
                <Input id="noteFile" name="noteFile" type="file" required />
              </div>
              <SubmitButton />
            </form>
            {state.message === 'error' && (
              <p className="mt-4 text-sm text-destructive">Could not process file. Please try a different document.</p>
            )}
            {state.tags && state.tags.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold">Suggested Tags:</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {state.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">
            <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link> or <Link href="/signup" className="text-primary font-semibold hover:underline">sign up</Link> to upload and share your notes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
