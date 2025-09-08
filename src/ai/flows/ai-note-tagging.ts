'use server';

/**
 * @fileOverview An AI agent for automatically tagging student notes.
 *
 * - aiNoteTagging - A function that handles the note tagging process.
 * - AiNoteTaggingInput - The input type for the aiNoteTagging function.
 * - AiNoteTaggingOutput - The return type for the aiNoteTagging function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiNoteTaggingInputSchema = z.object({
  noteDataUri: z
    .string()
    .describe(
      "The notes document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiNoteTaggingInput = z.infer<typeof AiNoteTaggingInputSchema>;

const AiNoteTaggingOutputSchema = z.object({
  tags: z.array(z.string()).describe('The tags for the notes document.'),
});
export type AiNoteTaggingOutput = z.infer<typeof AiNoteTaggingOutputSchema>;

export async function aiNoteTagging(input: AiNoteTaggingInput): Promise<AiNoteTaggingOutput> {
  return aiNoteTaggingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiNoteTaggingPrompt',
  input: {schema: AiNoteTaggingInputSchema},
  output: {schema: AiNoteTaggingOutputSchema},
  prompt: `You are an expert at understanding documents and creating tags for them.

You will receive a document and you will generate tags for it so that students can find it.

Return a list of tags that are relevant to the document.

Document: {{media url=noteDataUri}}`,
});

const aiNoteTaggingFlow = ai.defineFlow(
  {
    name: 'aiNoteTaggingFlow',
    inputSchema: AiNoteTaggingInputSchema,
    outputSchema: AiNoteTaggingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
