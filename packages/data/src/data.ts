import { Effect, Layer} from 'effect';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { CreateAgentType, EditAgentType, GetAgentType, DeleteAgentType, ToggleAgentType, SubmitAgentPromptType, FetchAgentPromptsType, UpdateOptimizerStateType } from '../types/agent.js';

// ES module compatible way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabaseClient = createClient(supabaseUrl, supabaseKey);



const makeDataLayer = Effect.gen(function* () {
    return {
        CreateAgent: (args: CreateAgentType) => Effect.gen(function* (){
            yield* Effect.tryPromise(async () => supabaseClient.from('agent-state').insert({
                name: args.name,
                original_prompt: args.originalPrompt,
                current_prompt: args.originalPrompt,
                toggle: true
            })).pipe(
                Effect.flatMap(output => {
                    console.log(`output: ${JSON.stringify(output)}`)
                    if (!output.error) {
                        return Effect.succeed({key: "success" as const, value: output.data!})
                    }
                    return Effect.fail({key: "error" as const, value: output.error})
                }),
                Effect.catchAll(error => Effect.fail({key: "error" as const, value: error.toString()}))
            )
        }),

        EditAgent: (args: EditAgentType) => Effect.gen(function* (){
            yield* Effect.tryPromise(async () => supabaseClient.from('agent-state').update({
                original_prompt: args.newPrompt
            }).eq('id', args.id))
        }),

        GetAgent: (args: GetAgentType) => Effect.gen(function* (){
            const output = Effect.tryPromise(async () => supabaseClient.from('agent-state').select('*').eq('id', args.id))
            const resp = yield* output;
            return resp.data?.[0] ?? ''
        }),

        DeleteAgent: (args: DeleteAgentType) => Effect.gen(function* (){
            const output = Effect.tryPromise(async () => supabaseClient.from('agent-state').delete().eq('id', args.id)).pipe(
                Effect.flatMap(output => Effect.gen(function* () {
                    yield* Effect.logInfo(`id: ${args.id}`)
                    yield* Effect.logInfo(`output: ${JSON.stringify(output)}`)
                    if (!output.error) {
                        return yield* Effect.succeed({key: "success" as const, value: output.data!})
                    }
                    return yield* Effect.fail({key: "error" as const, value: output.error})
                })),
                Effect.catchAll(error => Effect.fail({key: "error" as const, value: error.toString()}))
            )
            return yield* output
        }),

        ToggleAgent: (args: ToggleAgentType) => Effect.gen(function* (){
            yield* Effect.tryPromise(async () => supabaseClient.from('agent-state').update({
                toggle: args.toggle
            }).eq('id', args.id))
        }),

        ListAgents: () => Effect.gen(function* (){
            const output = yield* Effect.tryPromise(async () => supabaseClient.from('agent-state').select('*').order('created_at', {ascending: false}))
            if (!output.data) {
                yield* Effect.fail(null)
            }
            
            return output.data?.map( (agent) => {
                return {
                    id: agent.id,
                    createdAt: agent.created_at,
                    name: agent.name,
                    currentPrompt: agent.current_prompt,
                    originalPrompt: agent.original_prompt,
                    toggle: agent.toggle
                }
            })!
        }),

        SubmitAgentPrompt: (args: SubmitAgentPromptType) => Effect.gen(function* (){
            yield* Effect.tryPromise(async () => supabaseClient.from('messages').insert({
                role: args.role,
                agent_id: args.agentId,
                conversation_id: args.conversationId,
                prompt: args.prompt,
                last_optimized: new Date().toISOString()
            }))
        }),

        FetchAgentPrompts: (args: FetchAgentPromptsType) => {
            // policy for optimization: just fetch up to maxCount number of prompts for optimizing, and if less than ta
            return Effect.tryPromise(async () => {
                const currentDate = new Date().getTime()
                const prompts = await supabaseClient.from('messages').select('*').eq('id', args.id).order('last_optimized', {ascending: false}).limit(args.maxCount)
                const ids = await prompts.data?.map(prompt => prompt.id)
                if (!ids) {
                    return []
                }
                supabaseClient.from('messages').update({last_optimized: currentDate}).in('id', ids)
                return prompts.data
            })
        },

        UpdateOptimizerState: (args: UpdateOptimizerStateType) => Effect.gen(function* () {
            return Effect.tryPromise(async () => {
                const output = await supabaseClient.from('optimizer_state').update({deltas: args.deltas}).eq('id', args.id)
                if (!output.error) {
                    return {key: "success" as const, value: output.data!}
                }
                return {key: "error" as const, value: "0"}
            })
        })

        
    }
})

export class DataLayerRepo extends Effect.Tag('DataLayerRepo')<DataLayerRepo, Effect.Effect.Success<typeof makeDataLayer>>() {
    static readonly Live = Layer.effect(this, makeDataLayer)
}

export const DataLayer = Effect.serviceFunctions(DataLayerRepo)


