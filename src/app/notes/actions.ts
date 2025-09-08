'use server';

import { aiNoteTagging } from '@/ai/flows/ai-note-tagging';

export async function uploadAndTagNote(prevState: any, formData: FormData) {
  const file = formData.get('noteFile') as File;

  if (!file || file.size === 0) {
    return { message: 'error', tags: [] };
  }

  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await aiNoteTagging({ noteDataUri: dataUri });
    
    return { message: 'success', tags: result.tags };
  } catch (error) {
    console.error('AI tagging failed:', error);
    return { message: 'error', tags: [] };
  }
}
