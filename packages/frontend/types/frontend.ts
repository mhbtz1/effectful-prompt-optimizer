export type ChatMessage = {
    id: string;
    createdAt: string;
    agentId: string;
    lastOptimized: string;
    conversationId: string
    role: string;
    prompt: string
}