import { PlusCircle } from 'lucide-react';
import type { ChatMessage } from '../types/frontend.js';
import { useGetConversation, useGetConversationIds, useGetOrCreateConversation } from '../hooks/use-get-conversations.js';
import { Card, CardContent } from '@/components/ui/card';

interface ConversationsProps {
    messages: ChatMessage[];
    conversationId: string
}

interface ConversationsSidebarProps {
    onSelectConversation: (conversationId: string) => void;
    activeConversationId: string | null;
}

export function ConversationsSidebar ({ onSelectConversation, activeConversationId }: ConversationsSidebarProps) {
    const { data: conversationIds, isLoading: isLoadingConversationIds, error: errorConversationIds } = useGetConversationIds();

    console.log(`📊 ConversationsSidebar - conversationIds: ${JSON.stringify(conversationIds)}, isLoading: ${isLoadingConversationIds}, error:`, errorConversationIds)
    return (
        <div className="w-64 h-full bg-white rounded-lg shadow-md p-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversations</h3>
            {conversationIds?.map((conversation: { id: string, title: string, description: string, createdAt: string }) => {
                const isActive = activeConversationId === conversation.id;
                return (
                    <div key={conversation.id}>
                        <Card 
                            className={`mb-2 p-3 cursor-pointer transition-colors ${
                                isActive 
                                    ? 'bg-blue-100 border-blue-300' 
                                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                            } border rounded-lg`}
                            onClick={() => onSelectConversation(conversation.id)}
                        >
                            <CardContent className="text-xs text-gray-700">
                                <div className="font-medium">{conversation.title || 'Untitled'}</div>
                                <div className="text-gray-500 text-xs mt-1">
                                    {new Date(conversation.createdAt).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            })}
        </div>
    )
}


export function Conversations({ conversationId }: ConversationsProps) {
    const { data: messages, isLoading: isLoadingConversation, error: errorConversation, dataUpdatedAt, isFetching } = useGetConversation(conversationId);
    
    console.log(`📊 Conversations component - messages count: ${messages?.length}, conversationId: ${conversationId}, isLoading: ${isLoadingConversation}, isFetching: ${isFetching}, dataUpdatedAt: ${new Date(dataUpdatedAt).toLocaleTimeString()}, error: ${errorConversation}`)
    return (
        <div className="w-64 bg-white rounded-lg shadow-md p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Conversations</h3>
                <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="New Conversation"
                >
                    <PlusCircle className="w-5 h-5" />
                </button>
            </div>
            
            {conversationId && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Current Conversation</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {conversationId}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {messages?.length} message{messages?.length !== 1 ? 's' : ''}
                    </p>
                </div>
            )}
            
            <div className="space-y-2">
                {/* Future: List of past conversations will go here */}
                {!conversationId && (
                    <p className="text-sm text-gray-500 text-center py-4">
                        Start a new conversation by sending a message
                    </p>
                )}
            </div>
        </div>
    )
}