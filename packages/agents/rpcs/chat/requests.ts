import { Rpc, RpcGroup } from '@effect/rpc';
import { Schema as S } from 'effect';
import { ModelSchema } from '../../../agents/src/model-schema.js';

export class AgentRpcs extends RpcGroup.make(
  Rpc.make('CreateAgent', {
    success: S.Void,
    error: S.Any,
    payload: S.Struct({
      name: S.String,
      originalPrompt: S.String
    })
  }), 
  Rpc.make('EditAgent', {
    success: S.Void,
    error: S.Unknown,
    payload: S.Struct({
      id: S.String,
      newPrompt: S.String
    })
  }),
  Rpc.make('DeleteAgent', {
    success: S.Union(S.Struct({
        key: S.Literal("success"),
        value: S.NullOr(S.String)
      }),
    ),
    error: S.Struct({
        key: S.Literal("error"),
        value: S.NullOr(S.String)
    }),
    payload: S.Struct({
      id: S.String,
    })
  }),

  Rpc.make('ToggleAgent', {
    success: S.Void,
    error: S.Any,
    payload: S.Struct({
      id: S.String,
      toggle: S.Boolean,
    })
  }),

  Rpc.make('GetAgent', {
    success: S.Any,
    error: S.Any,
    payload: S.Struct({
      id: S.String,
    })
  }),

  Rpc.make('ListAgents', {
    success: S.Array(S.Struct({
      id: S.Any,
      createdAt: S.Any,
      name: S.Any,
      currentPrompt: S.String, 
      originalPrompt: S.String, 
      toggle: S.Boolean
    })),
    error: S.Any,
    payload: S.Struct({})
  }),


  Rpc.make('AgentOptimize', {
    success: S.Struct({
      optimized_prompt: S.String,
      contextMemory: S.Array(S.Struct({
        type: S.Union(S.Literal("fact"), S.Literal("concept"), S.Literal("observation")),
        content: S.String
      })),
      iterations: S.Number
    }),
    error: S.Any,
    payload: S.Struct({
      prompt: S.String,
      agentId: S.String,
    })
  }),

  Rpc.make('AgentChat', {
    success: S.Struct({
      response: S.String,
    }),
    error: S.Any,
    payload: S.Struct({
      prompt: S.String,
      model: S.String,
      agentId: S.String,
      conversationId: S.String
    })
  }),

  Rpc.make('AgentSubmitPrompt', {
    success: S.Void,
    error: S.Any,
    payload: S.Struct({
      role: S.String,
      agentId: S.String,
      prompt: S.String,
      conversationId: S.String,
    })
  }),

  Rpc.make('OptimizePrompt', {
    success: S.Struct({
      optimized_prompt: S.String,
      contextMemory: S.Array(S.Struct({
        type: S.Union(S.Literal("fact"), S.Literal("concept"), S.Literal("observation")),
        content: S.String
      })),
      iterations: S.Number
    }),
    error: S.Any,
    payload: S.Struct({
      prompt: S.String,
      agentId: S.optional(S.String),
    })
  }),
) {}

