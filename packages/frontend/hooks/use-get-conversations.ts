import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { conversationRpc } from '../src/rpc-client.js';
import { ClientRouter } from '../src/client-router.js';
import { ChatMessage } from 'types/frontend.js';

export const useGetOrCreateConversation = () => {
    return useMutation({
      mutationFn: async ({ title, description }: { title: string, description: string }) => {
        return await conversationRpc(ClientRouter.CreateConversation({ title: title || '', description: description || '' }));
      },
    });
  };

export const useGetConversation = (conversationId: string | null) => {
    return useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: async () => {
            if (!conversationId) {
                return [];
            }
            const result: ChatMessage[] = await conversationRpc(ClientRouter.GetConversationMessages({ conversationId }));
            return result;
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    })
}

export const useGetConversationIds = () => {
    return useQuery({
        queryKey: ['conversationIds'],
        queryFn: async () => {
            console.log('🔄 useGetConversationIds queryFn called');
            try {
                const result = await conversationRpc(ClientRouter.ListConversations({}));
                return result;
            } catch (error) {
                throw error;
            }
        },
        staleTime: 0,
    })
}