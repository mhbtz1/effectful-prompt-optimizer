import { Schema as S } from 'effect';
export const ModelSchema = S.Struct({
    model: S.String,
    temperature: S.Number,
    maxTokens: S.Number
})

export type ModelSchema = S.Schema.Type<typeof ModelSchema>