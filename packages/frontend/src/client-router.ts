import { Effect } from 'effect';
import { RpcClient, RpcGroup } from '@effect/rpc';
import { AgentRpcs } from '../../agents/rpcs/chat/requests';
import { ConversationRpcs } from '../../agents/rpcs/conversations/requests';

export const ClientRouter = Effect.serviceFunctions(RpcClient.make(
    AgentRpcs.merge(ConversationRpcs)))