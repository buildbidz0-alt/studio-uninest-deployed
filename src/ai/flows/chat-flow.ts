
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ChatInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.array(z.object({text: z.string()})),
    })
  ),
  message: z.string(),
});

export const ChatOutputSchema = z.string();

export type ChatInput = z.infer<typeof ChatInputSchema>;
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  const {history, message} = input;
  const prompt = [
    ...history,
    {
      role: 'user' as const,
      content: [{text: message}],
    },
  ];
  const {text} = await ai.generate({
    prompt,
    history: input.history,
  });
  return text;
}
