import { Effect } from 'effect';
import { AgentRpcs } from './requests.js';
import { DataLayerRepo } from '../../../data/src/data.js'
import { callOpenRouter } from '../../src/openrouter.js';



export const AgentRpcsLive = AgentRpcs.toLayer({
    CreateAgent: (args: { name: string, description: string, userPrompt: string }) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.CreateAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live))
    },

    DeleteAgent: (args: { id: string }) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.DeleteAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live))
    },

    GetAgent: (args: { id: string }) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.GetAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live))
    },
    
    ListAgents: () => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.ListAgents()
        }).pipe(Effect.provide(DataLayerRepo.Live))
    },

    AgentOptimize: (args: { id: string, model: string, maxCount?: number }) => {
        let maxCount = args.maxCount;
        if (!args.maxCount ) {
            maxCount = 10
        }
        // policy for fetching prompts to optimize here 
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            const prompts = yield* service.FetchAgentPrompts({id: args.id, maxCount: maxCount!})
            const effects = prompts!.map(prompt => Effect.tryPromise(async () => {
                service.FetchAgentPrompts({id: args.id, maxCount: 10})
                const response = await callOpenRouter({prompt, model: args.model})
                console.log(`response: ${response}`)
                return response;
            }).pipe(Effect.provide(DataLayerRepo.Live)))

            return yield* Effect.all(effects, {concurrency: 10})
        })
    },

    AgentChat: (args: { prompt: string, model: string }) => {
        return Effect.gen(function* () {
            try {
                const response = yield* Effect.tryPromise(async () => {
                    await callOpenRouter({prompt: args.prompt, model: args.model})
                })
                yield* Effect.logInfo(`response: ${response}`)
                return response;
            } catch (error) {
                yield* Effect.logInfo(`error: ${error}`)
                return {
                    error: JSON.stringify(error)
                }
            }
        }).pipe(Effect.provide(DataLayerRepo.Live))
    },

})