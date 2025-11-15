import { Effect, Context, Data, Layer } from 'effect';
import { GeneratorRepo, ReflectorRepo, CuratorRepo, AceRepo, ContextItemSchema } from '../services/all-services.js';
import { callOpenRouter } from '../../agents/src/openrouter.js';

class AceException extends Data.TaggedError("AceException")<{}> {}

export const makeAceRepo = Layer.succeed(AceRepo, {
    optimize: (systemPrompt: string, prompt: string, maxIterations: number) => Effect.gen(function* () {
        // Initialize in-memory context
        const contextMemory: (typeof ContextItemSchema.Type)[] = [];

        const generator = yield* GeneratorRepo;
        const reflector = yield* ReflectorRepo;
        const curator = yield* CuratorRepo;

        let currentPrompt = prompt;

        // Generate-Reflect-Curate-Context update loop
        for (let i = 0; i < maxIterations; i++) {
            // Step 1: Generate - produces trajectory (reasoning + response)
            const generatorResult = yield* generator.generate(systemPrompt, currentPrompt, contextMemory);

            // Step 2: Reflect - uses trajectory to generate insights
            const reflectionResult = yield* reflector.reflect(systemPrompt, generatorResult.trajectory);

            // Step 3: Curate - synthesizes insights into context items
            const curationResult = yield* curator.curate(systemPrompt, [...reflectionResult.insights]);

            // Step 4: Update context memory with new context items
            for (const contextItem of curationResult.contextItems) {
                contextMemory.push(contextItem);
            }

            // The context memory now guides the next iteration
        }

        const finalResponse = yield* Effect.tryPromise(async () => callOpenRouter({
            prompt: `You are a helpful assistant that generates a response to a query. The query is: <SYSTEM_PROMPT>${systemPrompt}</SYSTEM_PROMPT><QUERY>${prompt}</QUERY>. The context memory is: ${contextMemory.map(item => item.content).join(", ")}. You must generate a final response to the query, providing just an answer given the query and the compiled context memory.`,
            model: process.env.DEFAULT_MODEL_NAME!,
            temperature: 0.7,
            maxTokens: 1000
        }));

        const revisedSystemPrompt = yield* Effect.tryPromise(async () => callOpenRouter({
            prompt: `You are a helpful assistant that generates a response to a query. 
            The query is: <SYSTEM_PROMPT>${systemPrompt}</SYSTEM_PROMPT><QUERY>${prompt}</QUERY>. 
            The context memory is: ${contextMemory.map(item => item.content).join(", ")} 
            The final response is the following: ${finalResponse.response}. 
            You must generate a revised system prompt, taking into account the compiled memory, the final response generated, and the initial system prompt. You should align the initial intent with the system prompt while making minor edits that better reflect the query made by the user.`,
            model: process.env.DEFAULT_MODEL_NAME!,
            temperature: 0.7,
            maxTokens: 1000
        }));

        return {
            finalResponse: finalResponse.response,
            revisedSystemPrompt: revisedSystemPrompt.response,
            contextMemory,
            iterations: maxIterations
        };
    }).pipe(
        Effect.tapError(Effect.logError),
        Effect.tapErrorCause(Effect.logError),
    )
})

export const makeGeneratorRepo = Layer.succeed(GeneratorRepo, {
    generate: (systemPrompt: string, query: string, contextMemory: Array<{ type: "fact" | "concept" | "observation", content: string }>) => Effect.gen(function* () {
        // TODO: Implement actual generation logic that uses contextMemory
        // For now, return stub data

        const agentResult = yield* Effect.tryPromise(async () => callOpenRouter({
            prompt: `<SYSTEM_PROMPT> ${systemPrompt} </SYSTEM_PROMPT> <QUERY> ${query} </QUERY> <CONTEXT_MEMORY> ${contextMemory.map(item => item.content).join(", ")} </CONTEXT_MEMORY>. Now, you must generate a trajectory for properly answering the following query, providing a list of strategies to answer the query and outputting this in your final response.
            The trajectory you output should be formatted in a comma delimited list of strategies that can easily be parsed into a list.`,
            model: process.env.DEFAULT_MODEL_NAME!,
            temperature: 0.7,
            maxTokens: 1000
        }));

        return {
            trajectory: {
                reasoning: agentResult.response.split(",")
            },
        };
    })
})

export const makeReflectorRepo = Layer.succeed(ReflectorRepo, {
    reflect: (systemPrompt: string, trajectory: { reasoning: readonly string[] }) => Effect.gen(function* () {
        // TODO: Implement actual reflection logic that analyzes the trajectory
        // For now, return stub insights

        const agentResult = yield* Effect.tryPromise(async () => callOpenRouter({
            prompt: `<SYSTEM_PROMPT> ${systemPrompt} </SYSTEM_PROMPT> You are a expert in AI and interpreting complex user queries for building AI systems. 
            The goal for you is to generate insights / lessons learned from the given trajectory: <TRAJECTORY>${trajectory.reasoning.join(", ")}</TRAJECTORY>
            You must synthesize these values into a list of insights which can be used by a curator step to generate delta context items that can be used to further clarify the query.
            Output your context items in a comma delimited list that can easily be parsed / split into a list of context items.`,
            model: process.env.DEFAULT_MODEL_NAME!,
            temperature: 0.7,
            maxTokens: 1000
        }));

        const insights = agentResult.response.split(",")
        
        return {
            insights
        };

    })
})

export const makeCuratorRepo = Layer.succeed(CuratorRepo, {
    curate: (systemPrompt: string, insights: string[]) => Effect.gen(function* () {
        // TODO: Implement actual curation logic that synthesizes insights into context items
        // For now, convert insights into context items
        const agentResult = yield* Effect.tryPromise(async () => callOpenRouter({
            prompt: `<SYSTEM_PROMPT> ${systemPrompt} </SYSTEM_PROMPT> <INSIGHTS> ${insights.join(", ")} </INSIGHTS> You are a expert in AI and interpreting complex user queries for building AI systems. 
            The goal for you is to generate delta context items to add to the agent's memory given the following insights: <INSIGHTS>${insights.join(", ")}</INSIGHTS>
            You must synthesize these values into a list of contex items that can be used to ground / improve the agent's ability to answer the query.
            Output your context items in a comma delimited list that can easily be parsed / split into a list of context items.`,
            model: process.env.DEFAULT_MODEL_NAME!,
            temperature: 0.7,
            maxTokens: 1000
        }));

        const contextItems = agentResult.response.split(",").map( (item) => ({ type: "concept" as const, content: item }));
        
        return {
            contextItems
        };
    })
})