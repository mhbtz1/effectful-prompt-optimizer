import { Effect, Layer } from 'effect';
import { createClient } from '@supabase/supabase-js';
import type { UpdateConversationType } from '../../types/conversations.js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

const makeConversationDataLayer = Effect.gen(function* () {
    return {
        CreateConversation: (args: { title: string, description: string }) => Effect.gen(function* () {
            const result = yield* Effect.tryPromise(async () => 
                supabaseClient.from('conversations').insert({
                    title: args.title,
                    description: args.description,
                }).select().single()
            );
            
            if (result.error) {
                return yield* Effect.fail(new Error(result.error.message));
            }
            
            return {
                id: result.data.id,
                title: result.data.title,
                description: result.data.description,
                createdAt: result.data.created_at,
            };
        }),

        ListConversations: () => Effect.gen(function* () {
            // Use inner join to only get conversations that have at least one prompt
            const result = yield* Effect.tryPromise(async () => 
                supabaseClient
                    .from('conversations')
                    .select('id, title, description, created_at, messages!inner(id)')
                    .order('created_at', { ascending: false })
            )
            
            yield* Effect.logInfo(`ListConversations result: ${JSON.stringify(result)}`)
            if (result.error) {
                return yield* Effect.fail(new Error(result.error.message));
            }
            
            return result.data.map(conv => ({
                id: conv.id,
                title: conv.title,
                description: conv.description,
                createdAt: conv.created_at,
            }));
        }),

        GetConversation: (args: { conversationId: string }) => Effect.gen(function* () {
            const result = yield* Effect.tryPromise(async () => 
                supabaseClient.from('conversations').select('*').eq('id', args.conversationId).single()
            );
            
            if (result.error) {
                return yield* Effect.fail(new Error(result.error.message));
            }
            
            return {
                id: result.data.id,
                title: result.data.title,
                description: result.data.description,
                createdAt: result.data.created_at,
            };
        }),

        UpdateConversation: (args: UpdateConversationType) => Effect.gen(function* () {
            return yield* Effect.tryPromise(async () => supabaseClient.from('conversations').update({
                agentId: args.agentId,
                conversationId: args.conversationId
            }).eq('id', args.conversationId))
        }),


        GetConversationMessages: (args: { conversationId: string }) => Effect.gen(function* () {
            yield* Effect.logInfo(`GetConversationMessages args: ${JSON.stringify(args)}`)
            const result = yield* Effect.tryPromise(async () => 
                supabaseClient.from('messages').select('*').eq('conversation_id', args.conversationId).order('created_at', { ascending: true })
            );

            if (result.error) {
                return yield* Effect.fail(new Error(result.error.message));
            }
            
            yield* Effect.logInfo(`GetConversationMessages found ${result.data?.length || 0} messages`)
            
            return result.data.map(msg => ({
                id: msg.id,
                role: msg.role || 'user',
                prompt: msg.prompt,
                createdAt: msg.created_at,
                agentId: msg.agent_id || '',
                lastOptimized: msg.last_optimized || '',
                conversationId: msg.conversation_id,
            }));
        }),
    }
});

export class ConversationDataLayerRepo extends Effect.Tag('ConversationDataLayerRepo')<
    ConversationDataLayerRepo,
    Effect.Effect.Success<typeof makeConversationDataLayer>
>() {
    static readonly Live = Layer.effect(this, makeConversationDataLayer);
}