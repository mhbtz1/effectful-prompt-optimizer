import { Effect, Context } from 'effect';
import { Agent } from '@openai/agents';
import dotenv from 'dotenv';
dotenv.config();

class AgentService extends Context.Tag('AgentService')<
    AgentService,
    {
        run: (prompt: string) => Effect.Effect<string>
    }
>() {
}