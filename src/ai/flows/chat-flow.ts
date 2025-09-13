
'use server';

import {ai} from '@/ai/genkit';
import {type ChatInput, type ChatOutput} from './chat-schema';

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
