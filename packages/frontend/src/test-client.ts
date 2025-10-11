import { rpc } from './rpc-client';
import { ClientRouter} from './client-router';
import { Effect } from 'effect';

const response = rpc(ClientRouter.ListAgents({}));

console.log(await response)