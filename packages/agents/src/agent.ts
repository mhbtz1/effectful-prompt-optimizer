import { Effect, Context } from 'effect';
import { Agent } from '@openai/agents';
import { AgentRpcs } from '../rpcs/chat/requests.js';
import OpenAI from 'openai';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callOpenAI({
  prompt,
  model = 'gpt-4-turbo-preview',
  systemPrompt,
  temperature = 0.7,
  maxTokens = 1000,
}: {
  prompt: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  // Add system prompt if provided
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  // Add user prompt
  messages.push({ role: 'user', content: prompt });

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    return {
      response: completion.choices[0]?.message?.content || '',
      model: completion.model,
    };
  } catch (error) {
    throw new Error(`OpenAI API Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}


