import { Effect } from 'effect';
import { AgentRpcs } from './requests.js';
import { DataLayerRepo } from '../../../data/src/data.js'
import { callOpenRouter } from '../../src/openrouter.js';
import { ModelSchema } from '../../src/models.js';
import { makeMIProRepo, makeBootstrappingRepo } from '../../../optimizers/repos/mipro.js'
import { OptimizerRepo } from '../../../optimizers/services/mipro.js';
import { MODELS } from '../../src/models.js';

export const AgentRpcsLive = AgentRpcs.toLayer({
    CreateAgent: (args: { name: string, originalPrompt: string }) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.CreateAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live), Effect.withSpan('CreateAgent'))
    },

    DeleteAgent: (args: { id: string }) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.DeleteAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live), Effect.withSpan('DeleteAgent'))
    },

    EditAgent: (args: { id: string, newPrompt: string }) => {

        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.EditAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live), Effect.withSpan('EditAgent'))
    },

    ToggleAgent: (args: { id: string, toggle: boolean }) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.ToggleAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live), Effect.withSpan('ToggleAgent'))
    },

    GetAgent: (args: { id: string }) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.GetAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live), Effect.withSpan('GetAgent'))
    },
    
    ListAgents: () => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.ListAgents()
        }).pipe(Effect.provide(DataLayerRepo.Live), Effect.withSpan('ListAgents'))
    },

    AgentOptimize: (args: { id: string, model: string, maxCount?: number, studentModel: ModelSchema, teacherModel: ModelSchema }) => {
        let maxCount = args.maxCount;
        if (!args.maxCount ) {
            maxCount = 10
        }

        // policy for fetching prompts to optimize here 
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            const optimizerService = yield* OptimizerRepo;

            const prompts = yield* service.FetchAgentPrompts({id: args.id, maxCount: maxCount!})
            const effects = prompts!.map(prompt => Effect.gen(function* () {
                const studentModel = MODELS.get(args.studentModel.model) || MODELS.get("DEFAULT")!
                const teacherModel = MODELS.get(args.teacherModel.model) || MODELS.get("DEFAULT")!
                const response = yield* optimizerService.optimize(
                    prompt,
                    studentModel,   
                    teacherModel, 
                    undefined
                ).pipe(Effect.provide(makeBootstrappingRepo))

                return { score: 1, response: response.response }
            }).pipe(Effect.provide(DataLayerRepo.Live), Effect.provide(makeMIProRepo), Effect.withSpan('AgentOptimize')))

            return yield* Effect.all(effects, {concurrency: 10})
        })
    },

    AgentChat: (args: { prompt: string, model: string }) => {
        return Effect.gen(function* () {
            try {
                const response = yield* Effect.tryPromise(async () => {
                    return await callOpenRouter({prompt: args.prompt, model: args.model})
                })
                yield* Effect.logInfo(`response: ${JSON.stringify(response)}`)
                return response;
            } catch (error) {
                yield* Effect.logInfo(`error: ${JSON.stringify(error)}`)
                return {
                    error: JSON.stringify(error)
                }
            }
        }).pipe(Effect.provide(DataLayerRepo.Live), Effect.withSpan('AgentChat'))
    },

    AgentSubmitPrompt: (args: {agentId: string, prompt: string}) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.SubmitAgentPrompt({agentId: args.agentId, prompt: args.prompt})
        }).pipe(Effect.provide(DataLayerRepo.Live), Effect.withSpan('AgentSubmitPrompt'))
    },

})