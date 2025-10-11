import { Rpc, RpcGroup } from '@effect/rpc';
import { Schema as S } from 'effect';

export class AgentRpcs extends RpcGroup.make(
  Rpc.make('CreateAgent', {
    success: S.Union(S.Struct({
        key: S.Literal("success"),
        value: S.String
      }),
    ),
    error: S.Struct({
        key: S.Literal("error"),
        value: S.String
    }),
    payload: S.Struct({
      name: S.String,
      originalPrompt: S.String
    })
  }), 

  Rpc.make('DeleteAgent', {
    success: S.Union(S.Struct({
        key: S.Literal("success"),
        value: S.String
      }),
    ),
    error: S.Struct({
        key: S.Literal("error"),
        value: S.String
    }),
    payload: S.Struct({
      id: S.String,
    })
  }),

  Rpc.make('ToggleAgent', {
    success: S.Union(S.Struct({
        key: S.Literal("success"),
        value: S.String
      }),
    ),
    error: S.Struct({
        key: S.Literal("error"),
        value: S.String
    }),
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
    success: S.Array(S.Struct({
      response: S.String,
      model: S.String,
    })),
    error: S.Any,
    payload: S.Struct({
      id: S.String,
      model: S.String,
      prompt: S.String,
    })
  }),

  Rpc.make('AgentChat', {
    success: S.Any,
    error: S.Any,
    payload: S.Struct({
      prompt: S.String,
      model: S.String
    })
  }),
) {}

