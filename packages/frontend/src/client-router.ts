import { Effect } from 'effect';
import { RpcClient } from '@effect/rpc';
import { AgentRpcs } from '../../agents/rpcs/chat/requests';

export const ClientRouter = Effect.serviceFunctions(RpcClient.make(
    AgentRpcs
))



