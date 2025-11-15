import { Effect } from 'effect';
import { AgentRpcs } from './requests.js';
import { DataLayerRepo } from '../../../data/src/data.js'
import { callOpenRouter } from '../../src/openrouter.js';
import { AceRepo } from '../../../optimizers/services/all-services.js';
import { makeAceRepo, makeGeneratorRepo, makeReflectorRepo, makeCuratorRepo } from '../../../optimizers/repos/ace.js';

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
            yield* service.EditAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live), Effect.withSpan('EditAgent'), Effect.tapError(error => Effect.logError(error)), Effect.tapErrorCause(Effect.logError))
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
    }
    ,

    AgentOptimize: (args: { prompt: string, agentId: string }) => {
        // Reimplemented to use ACE optimization
        return Effect.gen(function* () {
            const dataService = yield* DataLayerRepo;
            const agent = yield* dataService.GetAgent({ id: args.agentId });

            // Use ACE optimization with the provided prompt
            const aceService = yield* AceRepo;
            yield* Effect.logInfo(`Optimizing prompt: ${args.prompt} for agent: ${args.agentId}`)
            const result = yield* aceService.optimize(agent.current_prompt, args.prompt, 1);
            yield* Effect.logInfo(`final result from optimizer: ${JSON.stringify(result)}`)
            return {
                optimized_prompt: result.finalResponse,
                contextMemory: result.contextMemory,
                iterations: result.iterations
            };
        }).pipe(
            Effect.provide(DataLayerRepo.Live),
            Effect.provide(makeAceRepo),
            Effect.provide(makeGeneratorRepo),
            Effect.provide(makeReflectorRepo),
            Effect.provide(makeCuratorRepo),
            Effect.withSpan('AgentOptimize')
        )
    },

    AgentChat: (args: { prompt: string, model: string, agentId: string }) => {
        return Effect.gen(function* () {
            try {
                yield* Effect.logInfo(`prompt: ${args.prompt}, model: ${args.model}, agentId: ${args.agentId}`)
                const response = yield* Effect.tryPromise(async () => {
                    return await callOpenRouter({prompt: args.prompt, model: args.model})
                }).pipe(Effect.tapError(error => Effect.logError(error)), Effect.tapErrorCause(Effect.logError))
                yield* Effect.logInfo(`response: ${JSON.stringify(response)}`)

                // Fetch the agent to get the current_prompt (system prompt)
                const dataService = yield* DataLayerRepo;
                const agent = yield* dataService.GetAgent({ id: args.agentId });

                // Run ACE optimization process after each response is received
                const aceService = yield* AceRepo;

                // check if toggle is set on agent before attempting to apply optimizations

                if (agent.toggle) {
                    yield* Effect.logInfo(`Running ACE optimization for agent: ${args.agentId}`)
                    const optimizationResult = yield* aceService.optimize(
                        agent.current_prompt, // Use the agent's current_prompt as the system prompt
                        args.prompt,
                        3 // maxIterations
                    );

                    yield* Effect.logInfo(`ACE optimization complete`)
                    yield* Effect.logInfo(`Old system prompt: ${agent.current_prompt}`)
                    yield* Effect.logInfo(`New system prompt: ${optimizationResult.revisedSystemPrompt}`)

                    // update the agent's system prompt
                    yield* dataService.EditAgent({id: args.agentId, newPrompt: optimizationResult.revisedSystemPrompt})
                }
                    // TODO: update the history of prompts received by the agent in the prompt_history column of the agent-state table
                // This would require implementing UpdatePromptHistory in DataLayerRepo

                return response;
            } catch (error) {
                yield* Effect.logInfo(`error: ${JSON.stringify(error)}`)
                return {
                    error: JSON.stringify(error)
                }
            }
        }).pipe(
            Effect.provide(DataLayerRepo.Live),
            Effect.provide(makeAceRepo),
            Effect.provide(makeGeneratorRepo),
            Effect.provide(makeReflectorRepo),
            Effect.provide(makeCuratorRepo),
            Effect.withSpan('AgentChat')
        )
    },

    AgentSubmitPrompt: (args: {agentId: string, prompt: string}) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            yield* service.SubmitAgentPrompt({agentId: args.agentId, prompt: args.prompt})
        }).pipe(Effect.provide(DataLayerRepo.Live), Effect.withSpan('AgentSubmitPrompt'))
    },

    OptimizePrompt: (args: { prompt: string, agentId?: string }) => {
        return Effect.gen(function* () {
            // If agentId is provided, fetch the agent (could be used to customize optimization)
            if (!args.agentId) {
                return yield* Effect.fail(new Error('Agent ID is required'));
            }
            const dataService = yield* DataLayerRepo;
            const agent = yield* dataService.GetAgent({ id: args.agentId });

            // Use ACE optimization with the provided prompt
            const aceService = yield* AceRepo;
            const result = yield* aceService.optimize(agent.current_prompt, args.prompt, 3);

            return {
                optimized_prompt: result.finalResponse,
                contextMemory: result.contextMemory,
                iterations: result.iterations
            };
        }).pipe(
            Effect.provide(DataLayerRepo.Live),
            Effect.provide(makeAceRepo),
            Effect.provide(makeGeneratorRepo),
            Effect.provide(makeReflectorRepo),
            Effect.provide(makeCuratorRepo),
            Effect.withSpan('OptimizePrompt')
        )
    },

})