import OpenAI from 'openai';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function callOpenRouter({
  prompt,
  model,
  temperature = 0.7,
  maxTokens = 1000,
}: {
  prompt: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  // Add user prompt
  messages.push({ role: 'user', content: prompt });

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    })

    const response = {
      response: completion.choices[0]?.message?.content || '',
      model: completion.model,
    };

    console.log(`response: ${JSON.stringify(response)}`)
    return response
  } catch (error) {
    throw new Error(`OpenAI API Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}


