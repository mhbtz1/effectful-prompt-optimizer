import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { type ChatMessage } from '../api/client';
import { Send, Loader2, ChevronDown } from 'lucide-react';
import { rpc } from '../rpc-client.js';
import { ClientRouter } from '../client-router.js';
import { Effect } from 'effect';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';

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
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const { data: agents, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      const effect = rpc(ClientRouter.ListAgents({}));
      return await Effect.runPromise(effect) as Agent[];
    },
  });

  const chatMutation = useMutation({
    mutationFn: async ({prompt, model}: {prompt: string, model?: string }) => {
      const response = await rpc(ClientRouter.AgentChat({
      prompt: prompt,
      model: model || "alibaba/tongyi-deepresearch-30b-a3b:free"
    }))

    console.log(`response: ${JSON.stringify(response)}`)
    return { role: "assistant", content: response.response }
  
  },
    onSuccess: ({ role, content }: { role: string, content: string }) => {
      setMessages((prev) => [...prev, { role, content }]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    chatMutation.mutate({
      prompt: userMessage.content
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                <ListboxButton className="relative w-64 cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {agentsLoading ? (
                    <div className="px-3 py-2 text-sm text-gray-500 flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading agents...
                    </div>
                  ) : agents && agents.length > 0 ? (
                    <>
                      <ListboxOption
                        value={null}
                        className="relative cursor-pointer select-none py-2 px-3 data-[focus]:bg-gray-100 text-gray-900"
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
                          className="relative cursor-pointer select-none py-2 px-3 data-[focus]:bg-gray-100 text-gray-900"
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
            {messages.length === 0 ? (
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
                    <p className="whitespace-pre-wrap">{message.content}</p>
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
                disabled={chatMutation.isPending}
              />
              <button
                type="submit"
                disabled={chatMutation.isPending || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
