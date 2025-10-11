// API client for RPC endpoints

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  stream?: boolean;
}

export interface ChatResponse {
  message: ChatMessage;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OptimizeRequest {
  prompt: string;
  examples?: Array<{ input: string; output: string }>;
}

export interface OptimizeResponse {
  optimized_prompt: string;
  metrics?: Record<string, number>;
}

export interface ToggleRequest {
  feature: string;
  enabled: boolean;
}

export interface ToggleResponse {
  feature: string;
  enabled: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function chatAPI(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/rpc/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.statusText}`);
  }

  return response.json();
}

export async function optimizeAPI(request: OptimizeRequest): Promise<OptimizeResponse> {
  const response = await fetch(`${API_BASE_URL}/rpc/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Optimize API error: ${response.statusText}`);
  }

  return response.json();
}

export async function toggleAPI(request: ToggleRequest): Promise<ToggleResponse> {
  const response = await fetch(`${API_BASE_URL}/rpc/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Toggle API error: ${response.statusText}`);
  }

  return response.json();
}
