import { createFileRoute } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { type ChatMessage } from '../api/client';
import { Send, Loader2 } from 'lucide-react';
import { rpc } from '../rpc-client.js';
import { ClientRouter } from '../client-router.js';

export const Route = createFileRoute('/chat')({
  component: ChatComponent,
});

function ChatComponent() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');

  const chatMutation = useMutation({
    mutationFn: async ({prompt, model, role}: {prompt: string, model?: string, role?: "user" | "assistant"}) => {
      const response = await rpc(ClientRouter.AgentChat({
      prompt: prompt,
      model: model || "alibaba/tongyi-deepresearch-30b-a3b:free"
    }))

    console.log(`response: ${JSON.stringify(response)}`)

    let nextRole = "user";
    if (role === "user") {
      nextRole = "assistant";
    }
    return { role: nextRole, content: response.response }
  
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
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Chat</h2>
          <p className="text-sm text-gray-600 mt-1">
            Interact with the chat API
          </p>
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
