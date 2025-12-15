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
            yield* service.CreateAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live), Effect.withSpan('CreateAgent'), Effect.tapError(error => Effect.logError(error)), Effect.tapErrorCause(Effect.logError))
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
            yield* service.ToggleAgent(args)
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

    AgentChat: (args: { prompt: string, model: string, agentId: string, conversationId: string }) => {
        return Effect.gen(function* () {
            yield* Effect.logInfo(`prompt: ${args.prompt}, model: ${args.model}, agentId: ${args.agentId}, conversationId: ${args.conversationId}`)
            
            const dataService = yield* DataLayerRepo;
            
            const output = yield* Effect.tryPromise(async () => {
                return await callOpenRouter({prompt: args.prompt, model: args.model, apiKey: process.env.OPENAI_API_KEY!})
            }).pipe(Effect.tapError(Effect.logError), Effect.tapErrorCause(Effect.logError))

            // Save assistant response to database
            yield* dataService.SubmitAgentPrompt({
                role: 'assistant',
                agentId: args.agentId,
                conversationId: args.conversationId,
                prompt: output.response,
            });

            // Fetch the agent to get the current_prompt (system prompt)
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

            const response = output.response

            return { response }
        }).pipe(
            Effect.provide(DataLayerRepo.Live),
            Effect.provide(makeAceRepo),
            Effect.provide(makeGeneratorRepo),
            Effect.provide(makeReflectorRepo),
            Effect.provide(makeCuratorRepo),
            Effect.withSpan('AgentChat')
        )
    },

    AgentSubmitPrompt: (args: {role: string, agentId: string, prompt: string, conversationId: string}) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            yield* Effect.logInfo(`Submitting prompt: ${args.prompt} for agent: ${args.agentId} in conversation: ${args.conversationId}`)
            yield* service.SubmitAgentPrompt({role: args.role, agentId: args.agentId, prompt: args.prompt, conversationId: args.conversationId})
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