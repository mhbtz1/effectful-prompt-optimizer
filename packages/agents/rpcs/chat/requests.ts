import { Rpc, RpcGroup } from '@effect/rpc';
import { Schema as S } from 'effect';

export const CreateAgentResponse = S.Struct({
  id: S.String,
  name: S.String,
  description: S.String,
  triggers: S.Struct({
    keywords: S.Array(S.String),
    playbook: S.String,
  }),
  valid_emails: S.Struct({
    emails: S.Array(S.String),
  }),
})
export const CreateAgentResponseType = typeof CreateAgentResponse.Type

export const UpdateAgentResponse = S.Struct({
  id: S.String,
  name: S.String,
  description: S.String,
  triggers: S.Struct({
    keywords: S.Array(S.String),
    playbook: S.String,
  }),
  valid_emails: S.Struct({
    emails: S.Array(S.String),
  }),
})
export const UpdateAgentResponseType = typeof UpdateAgentResponse.Type

export const DeleteAgentResponse = S.Struct({
  success: S.Boolean,
})
export const DeleteAgentResponseType = typeof DeleteAgentResponse.Type

export const GetAgentResponse = S.Struct({
  id: S.String,
  name: S.String,
  description: S.String,
  triggers: S.Struct({
    keywords: S.Array(S.String),
    playbook: S.String,
  }),
})
export const GetAgentResponseType = typeof GetAgentResponse.Type

export const ListAgentsResponse = S.Array(S.Struct({
  id: S.String,
  name: S.String,
  description: S.String,
  triggers: S.Struct({
    keywords: S.Array(S.String),
    playbook: S.String,
  }),
  valid_emails: S.Struct({
    emails: S.Array(S.String),
  }),
}))
export const ListAgentsResponseType = typeof ListAgentsResponse.Type  


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
      description: S.String,
      userPrompt: S.String
    })
  }),

  Rpc.make('UpdateAgent', {
    success: S.Struct({
      id: S.String,
      name: S.String,
      description: S.String,
      triggers: S.String,
    }),
    error: S.String,
    payload: S.Struct({
      id: S.String,
      name: S.optional(S.String),
      description: S.optional(S.String),
      triggers: S.optional(S.String),
    })
  }),

  Rpc.make('DeleteAgent', {
    success: S.Struct({
      success: S.Boolean,
    }),
    error: S.String,
    payload: S.Struct({
      id: S.String,
    })
  }),

  Rpc.make('GetAgent', {
    success: S.Struct({
      id: S.String,
      name: S.String,
      description: S.String,
      triggers: S.String,
    }),
    error: S.String,
    payload: S.Struct({
      id: S.String,
    })
  }),

  Rpc.make('ListAgents', {
    success: S.Array(S.Struct({
      id: S.String,
      name: S.String,
      description: S.String,
      triggers: S.Struct({
        keywords: S.String,
        playbook: S.String,
      }),
      valid_emails: S.Struct({
        emails: S.String,
      })
    })),
    error: S.String,
    payload: S.Struct({})
  }),

  Rpc.make('AgentSendEmail', {
    success: S.Struct({
      success: S.Boolean,
      messageId: S.optional(S.String),
    }),
    error: S.String,
    payload: S.Struct({
      agentId: S.String,
      from: S.String,
      to: S.Union(S.String, S.Array(S.String)),
      subject: S.String,
      html: S.optional(S.String),
      text: S.optional(S.String),
      cc: S.optional(S.Union(S.String, S.Array(S.String))),
      bcc: S.optional(S.Union(S.String, S.Array(S.String))),
      replyTo: S.optional(S.String),
    })
  }),

  Rpc.make('AgentLLMCall', {
    success: S.Struct({
      response: S.String,
      model: S.String,
      tokensUsed: S.optional(S.Number),
    }),
    error: S.String,
    payload: S.Struct({
      agentId: S.String,
      prompt: S.String,
      model: S.optional(S.String),
      systemPrompt: S.optional(S.String),
      temperature: S.optional(S.Number),
      maxTokens: S.optional(S.Number),
    })
  }),
) {}

