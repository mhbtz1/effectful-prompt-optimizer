import OpenAI from 'openai';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


export async function callOpenRouter({
  prompt,
  model,
  apiKey,
  temperature = 0.0,
  maxTokens = 1000,
}: {
  prompt: string;
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}) {

  console.log(`apiKey: ${apiKey}`)
  
  const openai = new OpenAI({
    apiKey
  });
  
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
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

    return response
  } catch (error) {
    throw new Error(`OpenAI API Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}


