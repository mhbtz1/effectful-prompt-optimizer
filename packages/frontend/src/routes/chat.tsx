import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Send, Loader2, ChevronDown } from 'lucide-react';
import { rpc, conversationRpc } from '../rpc-client.js';
import { ClientRouter } from '../client-router.js';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import type { ChatMessage } from '../../types/frontend.js';
import { ConversationsSidebar, Conversations } from '../../components/conversations.js';
import { useGetConversation, useGetOrCreateConversation } from '../../hooks/use-get-conversations.js';
import { toast } from 'sonner';

export const Route = createFileRoute('/chat')({
  component: ChatComponent,
});

interface Agent {
  id: string;
  name: string;
  description: string;
  currentPrompt: string;
  originalPrompt: string;
  toggle: boolean;
  createdAt: string;
}

function ChatComponent() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  const createConversationMutation = useGetOrCreateConversation();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  console.log('📍 selectedConversationId:', selectedConversationId)

  // Sync selectedConversationId with currentConversationId when it's created
  useEffect(() => {
    if (!selectedConversationId) {
      console.log('🔧 Creating new conversation...');
      createConversationMutation.mutateAsync({
        title: '',
        description: '',
      }).then((data) => {
        console.log('✅ Conversation created:', data.id);
        setSelectedConversationId(data.id);
      }).catch((error) => {
        console.error('❌ Failed to create conversation:', error);
      })
    }
  }, []);
  
  // Fetch messages for the active conversation
  const { data: messages, isLoading: isLoadingMessages, error: errorMessages } = useGetConversation(selectedConversationId);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const { data: agents, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      return await rpc(ClientRouter.ListAgents({}));
    },
  });

  const chatMutation = useMutation({
    mutationFn: async ({ prompt, conversationId }: { prompt: string, conversationId: string }) => {
      if (!selectedAgent) {
        toast.error('Please select an agent');
        return;
      }

      const result = await rpc(ClientRouter.AgentChat({
        prompt: prompt,
        model: import.meta.env.VITE_DEFAULT_MODEL_NAME,
        agentId: selectedAgent?.id,
        conversationId: conversationId
      }))
      // Extract the response string from the result
      return { response: result.response, conversationId }
    },
    onSuccess: (data) => {
      if (!data) return;
      queryClient.invalidateQueries({ queryKey: ['conversation', data.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversationIds'] });
      setInput('');
    }
  });

  console.log('chatMutation:', {
    isPending: chatMutation.isPending,
    isSuccess: chatMutation.isSuccess,
    isError: chatMutation.isError,
    data: chatMutation.data
  })

  const submitPromptMutation = useMutation({
    mutationFn: async ({agentId, role, prompt, conversationId}: {agentId: string | undefined, role: string, prompt: string, conversationId: string}) => {
      if (!agentId) return;
      const response = await rpc(ClientRouter.AgentSubmitPrompt({
        role,
        agentId: agentId,
        prompt: prompt,
        conversationId: conversationId
      }));
      return { response, conversationId }
    },
    onSuccess: () => {
      // Invalidate conversation messages query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
    },
    onError: (error) => {
      console.error(`error: ${JSON.stringify(error)}`);
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedConversationId) return;

    const userPrompt = input.trim();
    // AgentChat handles saving the user message

    await submitPromptMutation.mutateAsync({
      agentId: selectedAgent?.id,
      role: "user",
      prompt: userPrompt,
      conversationId: selectedConversationId
    });

    const response = await chatMutation.mutateAsync({
      prompt: userPrompt,
      conversationId: selectedConversationId
    });

    console.log(`full chat response: ${JSON.stringify(response)}`)
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-4">
        <ConversationsSidebar 
          onSelectConversation={handleSelectConversation}
          activeConversationId={selectedConversationId}
        />
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chat</h2>
              <p className="text-sm text-gray-600 mt-1">
                Interact with the chat API
              </p>
            </div>
            <div className="ml-4">
              <Listbox value={selectedAgent} onChange={setSelectedAgent}>
                <div className="relative">
                  <ListboxButton className="relative w-64 cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:border-transparent">
                    <span className="block truncate">
                      {selectedAgent ? (
                        <span className="text-sm">
                          <span className="font-medium text-gray-900">{selectedAgent.name}</span>
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Select an agent...</span>
                      )}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions 
                    anchor="bottom start"
                    transition
                    className="z-50 mt-1 w-64 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none [--anchor-gap:0.25rem] transition duration-500 ease-in-out data-[closed]:opacity-0 data-[closed]:scale-95">
                    {agentsLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500 flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading agents...
                      </div>
                    ) : agents && agents.length > 0 ? (
                      <>
                        <ListboxOption
                          value={null}
                          className="relative cursor-pointer select-none py-2 px-3 data-[focus]:bg-gray-100 text-gray-900 [&:hover]:cursor-pointer"
                        >
                          {({ selected }) => (
                            <div>
                              <span className={`block truncate text-sm ${selected ? 'font-semibold' : 'font-normal'}`}>
                                No agent (default)
                              </span>
                            </div>
                          )}
                        </ListboxOption>
                        {agents.map((agent: Agent) => (
                          <ListboxOption
                            key={agent.id}
                            value={agent}
                            className="relative cursor-pointer select-none py-2 px-3 data-[focus]:bg-gray-100 text-gray-900 [&:hover]:cursor-pointer"
                          >
                            {({ selected }) => (
                              <div>
                                <span className={`block truncate text-sm ${selected ? 'font-semibold' : 'font-normal'}`}>
                                  {agent.name}
                                </span>
                                <span className="block truncate text-xs text-gray-500 mt-0.5">
                                  {agent.description}
                                </span>
                              </div>
                            )}
                          </ListboxOption>
                        ))}
                      </>
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No agents available
                      </div>
                    )}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>
          </div>

          <div className="h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(!messages || (messages && messages.length === 0)) ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Start a conversation by typing a message below</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </p>
                      <p className="whitespace-pre-wrap">{message.prompt}</p>
                    </div>
                  </div>
                ))
              )}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 text-gray-900">
                    <p className="text-sm font-medium mb-1">Assistant</p>
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4">
              {chatMutation.isError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    Error: {(chatMutation.error as Error).message}
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  disabled={chatMutation.isPending || !selectedAgent?.id}
                />
                <button
                  type="submit"
                  disabled={chatMutation.isPending || !input.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
