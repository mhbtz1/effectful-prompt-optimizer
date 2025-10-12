import { makeBootstrappingRepo } from "./repos/mipro.js"
import { BootstrappingRepo } from "./services/mipro.js"
import { Effect } from "effect"
import { callOpenRouter } from "../agents/src/openrouter.js"

const trainset = [{
    input: "What is the capital of France?",
    output: "Paris"
}, {
    input: "What is the capital of Germany?",
    output: "Berlin"
}, {
    input: "What is the capital of Italy?",
    output: "Rome"
}, {
    input: "What is the capital of Spain?",
    output: "Madrid"
}, {
    input: "What is the capital of Portugal?",
    output: "Lisbon"
}]

const exampleProgram = Effect.gen(function* () {
    return {
        predict: (prompt: string) => {
            return Effect.tryPromise(async () => {
                const formattedPrompt = `Answer the following prompt to the best of your ability: ${prompt}`
                const response = await callOpenRouter({
                    prompt: formattedPrompt,
                    model: "alibaba/tongyi-deepresearch-30b-a3b:free",
                    temperature: 0.7,
                    maxTokens: 1000,
                })
                return {score: Math.random(), response: response.response}
            })
        }
    }
})

const test = Effect.gen(function* () {
    const repo = yield* BootstrappingRepo
    const program = yield* exampleProgram
    return yield* repo.bootstrap(program, trainset)
}).pipe(Effect.provide(makeBootstrappingRepo))

await Effect.runPromise(test)