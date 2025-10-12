import { Schema as S } from 'effect';

export const ProgramSchema = S.Struct({
    model: S.String,
    prompt: S.String
})

export type ProgramSchema = S.Schema.Type<typeof ProgramSchema>

export const DataSchema = S.Array(S.Struct({
    generatedResponse: S.String,
    groundedResponse: S.String
}))

export type DataSchema = S.Schema.Type<typeof DataSchema>

export const BootstrapSchema = S.Struct({
    program: ProgramSchema,
    trainset: DataSchema
})

export type BootstrapSchema = S.Schema.Type<typeof BootstrapSchema>

