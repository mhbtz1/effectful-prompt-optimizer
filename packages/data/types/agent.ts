export type EditAgentType ={
    id: string;
    newPrompt: string;
}

export type CreateAgentType = {
    name: string;
    originalPrompt: string;
}

export type GetAgentType = {
    id: string;
}

export type DeleteAgentType = {
    id: string;
}

export type ToggleAgentType = {
    id: string;
    toggle: boolean;
}

export type ListAgentsType = {
    id: string;
    createdAt: string;
    name: string;
    currentPrompt: string;
    originalPrompt: string;
    toggle: boolean;
}

export type UpdateOptimizerStateType = {
    id: string;
    deltas: string[];
}

export type FetchAgentPromptsType = {
    id: string;
    maxCount: number;
}

export type SubmitAgentPromptType = {
    role: string;
    agentId: string;
    conversationId: string;
    prompt: string;
}