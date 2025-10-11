import { rpc } from './rpc-client';
import { ClientRouter} from './client-router';
import { Effect } from 'effect';

const response = rpc(ClientRouter.AgentChat({
  prompt: 'What is the capital of France?',
  model: 'alibaba/tongyi-deepresearch-30b-a3b:free',
}));

console.log(await Effect.runPromise(response))