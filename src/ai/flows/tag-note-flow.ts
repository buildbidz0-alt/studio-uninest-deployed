'use server';
/**
 * @fileOverview An AI flow to automatically tag uploaded student notes.
 *
 * - tagNote - A function that analyzes a document and suggests relevant tags.
 * - TagNoteInput - The input type for the tagNote function.
 * - TagNoteOutput - The return type for the tagNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TagNoteInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A document file (e.g., PDF, image of notes) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileName: z.string().describe('The name of the file.'),
});
export type TagNoteInput = z.infer<typeof TagNoteInputSchema>;

const TagNoteOutputSchema = z.object({
  tags: z.array(z.string()).describe('A list of 3-5 relevant tags for the document. Tags should be concise, relevant, and in lowercase. E.g., "calculus", "thermodynamics", "organic chemistry".'),
});
export type TagNoteOutput = z.infer<typeof TagNoteOutputSchema>;

export async function tagNote(input: TagNoteInput): Promise<TagNoteOutput> {
  return tagNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tagNotePrompt',
  input: {schema: TagNoteInputSchema},
  output: {schema: TagNoteOutputSchema},
  prompt: `You are an expert academic librarian. Your task is to analyze the following document and generate 3-5 concise, relevant, lowercase tags to categorize it for other students.

Focus on the main subjects, topics, and concepts. For example, if it's a lecture on derivatives, tags could be "calculus", "derivatives", "mathematics".

Filename: {{{fileName}}}
Document: {{media url=fileDataUri}}`,
});

const tagNoteFlow = ai.defineFlow(
  {
    name: 'tagNoteFlow',
    inputSchema: TagNoteInputSchema,
    outputSchema: TagNoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
