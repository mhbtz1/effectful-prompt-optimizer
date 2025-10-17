import { Schema as S } from 'effect';

export const ProgramSchema = S.Struct({
    model: S.String,
    prompt: S.String
})

export const ContextPlaybookSchema = S.Array(S.Struct({
    delta: S.String
}))

export const DataSchema = S.Array(S.Struct({
    input: S.String,
    output: S.String
}))
export const BootstrapSchema = S.Struct({
    program: ProgramSchema,
    trainset: DataSchema
})

export type ProgramSchema = S.Schema.Type<typeof ProgramSchema>
export type ContextPlaybookSchema = S.Schema.Type<typeof ContextPlaybookSchema>
export type DataSchema = S.Schema.Type<typeof DataSchema>
export type BootstrapSchema = S.Schema.Type<typeof BootstrapSchema>

