import { makeMIProRepo } from './repos/mipro.js';
import { makeBootstrappingRepo } from "./repos/bootstrap.js"
import { type ModuleServiceProps } from "./services/all-services.js"
import { Effect } from 'effect';
import { callOpenRouter } from "../agents/src/openrouter.js";
import { OptimizerRepo, BootstrappingRepo } from "./services/all-services.js";
import type { UnknownException } from "effect/Cause";
import dotenv from 'dotenv';

dotenv.config();

const modelName = process.env.VITE_DEFAULT_MODEL_NAME ?? 'alibaba/tongyi-deepresearch-30b-a3b:free'


const exampleProgram = Effect.gen(function* () {
    return {
        predict: (prompt: string) => {
            return Effect.tryPromise(async () => {
                const formattedPrompt = `Answer the following prompt to the best of your ability: ${prompt}`
                const response = await callOpenRouter({
                    prompt: formattedPrompt,
                    model: modelName,
                    temperature: 0.7,
                    maxTokens: 1000,
                })
                return {score: Math.random(), response: response.response}
            })
        }
    }
})

const test = Effect.gen(function* () {
    return Effect.gen(function* () {
        const repo = yield* OptimizerRepo
        const bootstrapper = yield* BootstrappingRepo
        const studentModel = yield* exampleProgram
        const teacherModel = yield* exampleProgram

        repo.optimize(
            "What is the capital of France?",
            studentModel,
            teacherModel,
            [{
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
            }])

    }).pipe(Effect.provide(makeMIProRepo), Effect.provide(makeBootstrappingRepo))
})


Effect.runSync(test)