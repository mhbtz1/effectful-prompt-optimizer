import { Effect, Schema as S } from 'effect';
import { type ModuleServiceProps } from '../../optimizers/services/mipro.js';
import { callOpenRouter } from './openrouter.js';

export const ModelSchema = S.Struct({
    model: S.String,
    temperature: S.Number,
    maxTokens: S.Number
})

export type ModelSchema = S.Schema.Type<typeof ModelSchema>

export const MODELS = new Map<string, ModuleServiceProps>();
MODELS.set("ONE", {
    predict: (prompt: string) => {
        return Effect.tryPromise(async () => {
            const response = await callOpenRouter({
                prompt: `Answer the prompt, and provide reasoning for your answer in a numbered list: ${prompt}`,
                model: "alibaba/tongyi-deepresearch-30b-a3b:free",
                temperature: 0.7,
                maxTokens: 1000
            })
            return {score: 1, response: response.response}
        })
    }
})
MODELS.set("TWO", {
    predict: (prompt: string) => {
        return Effect.tryPromise(async () => {
            const response = await callOpenRouter({
                prompt: `Answer the following prompt to the best of your ability: ${prompt}`,
                model: "alibaba/tongyi-deepresearch-30b-a3b:free",
                temperature: 0.7,
                maxTokens: 1000
            })
            return {score: 1, response: response.response}
        })
    }
})
MODELS.set("DEFAULT", {
    predict: (prompt: string) => {
        return Effect.tryPromise(async () => {
            const response = await callOpenRouter({
                prompt: `Answer the following prompt to the best of your ability: ${prompt}`,
                model: "alibaba/tongyi-deepresearch-30b-a3b:free",
                temperature: 0.7,
                maxTokens: 1000
            })
            return {score: 1, response: response.response}
        })
    }
})