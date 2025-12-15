import { Rpc, RpcGroup } from '@effect/rpc';
import { Schema as S } from 'effect';

export class ConversationRpcs extends RpcGroup.make(
  Rpc.make('CreateConversation', {
    success: S.Struct({
      id: S.String,
      title: S.String,
      description: S.String,
      createdAt: S.String, 
    }),
    error: S.Unknown,
    payload: S.Struct({
      title: S.String,
      description: S.String,
    })
  }),
  Rpc.make('ListConversations', {
    success: S.Array(S.Struct({
      id: S.String,
      title: S.String,
      description: S.String,
      createdAt: S.String,
    })),
    error: S.Unknown,
    payload: S.Void,
  }),
  Rpc.make('GetConversation', {
    success: S.Struct({
      id: S.String,
      title: S.String,
      description: S.String,
      createdAt: S.String,
    }),
    error: S.Unknown,
    payload: S.Struct({
      conversationId: S.String,
    })
  }),
  Rpc.make('GetConversationMessages', {
    success: S.Array(S.Struct({
      id: S.String,
      role: S.String,
      prompt: S.String,
      createdAt: S.String,
      agentId: S.String,
      lastOptimized: S.String,
      conversationId: S.String,
    })),
    error: S.Unknown,
    payload: S.Struct({
      conversationId: S.String,
    })
  })
) {}
