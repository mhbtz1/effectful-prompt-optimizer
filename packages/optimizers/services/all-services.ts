import { Effect, Context, Data, Schema} from 'effect';
import { DataSchema, ContextPlaybookSchema } from '../schemas/data.js';
import type { UnknownException } from 'effect/Cause';

export const playbook = new Map<string, ContextPlaybookSchema>(); // should be a supabase table

export interface ModuleServiceProps {
    predict: (prompt: string) => Effect.Effect<{score: number, response: string}, UnknownException>
}

export interface BootstrappingRepoProps {
    bootstrap: (
        program: ModuleServiceProps,
        trainset: DataSchema,
    ) => Effect.Effect<Map<number, any[]>, UnknownException>
}

export interface OptimizerRepoProps {
    optimize: (
        prompt: string,
        student: ModuleServiceProps,
        teacher: ModuleServiceProps,
        trainset?: DataSchema,
    ) => Effect.Effect<{ score: number, response: string}, never, BootstrappingRepo>
}

export class ModuleService extends Context.Tag('ModuleService')<ModuleService, ModuleServiceProps> () {}
export class OptimizerService extends Context.Tag('OptimizerService')<OptimizerService, OptimizerRepoProps> () {}
export class BootstrappingRepo extends Context.Tag('BootstrappingRepo')<BootstrappingRepo, BootstrappingRepoProps> () {}
export class OptimizerRepo extends Context.Tag('OptimizerService')<OptimizerRepo, OptimizerRepoProps> () {}

class AceException extends Data.TaggedError("AceException")<{}> {}
class GeneratorException extends Data.TaggedError("GeneratorException")<{}> {}
class ReflectorException extends Data.TaggedError("ReflectorException")<{}> {}
class CuratorException extends Data.TaggedError("CuratorException")<{}> {}

const TrajectorySchema = Schema.Struct({
    reasoning: Schema.Array(Schema.String),
})

const ReflectionSchema = Schema.Struct({
    insights: Schema.Array(Schema.String),
})

const ContextCategories = Schema.Union(Schema.Literal("fact"), Schema.Literal("concept"), Schema.Literal("observation"))

export const ContextItemSchema = Schema.Struct({
    type: ContextCategories,
    content: Schema.String,
})

const CuratedSchema = Schema.Struct({
    contextItems: Schema.Array(ContextItemSchema),
})

const GeneratorSchema = Schema.Struct({
    trajectory: TrajectorySchema,
})

const AceResultSchema = Schema.Struct({
    revisedSystemPrompt: Schema.String,
    finalResponse: Schema.String,
    contextMemory: Schema.Array(ContextItemSchema),
    iterations: Schema.Number,
})


export class GeneratorRepo extends Context.Tag("GeneratorRepo")<GeneratorRepo, {
    generate: (systemPrompt: string, query: string, contextMemory: typeof ContextItemSchema.Type[]) => Effect.Effect<typeof GeneratorSchema.Type, Error, never>
}> () {}

export class ReflectorRepo extends Context.Tag("ReflectorRepo")<ReflectorRepo, {
    reflect: (systemPrompt: string, trajectory: typeof TrajectorySchema.Type) => Effect.Effect<typeof ReflectionSchema.Type, Error, never>
}> () {}

export class CuratorRepo extends Context.Tag("CuratorRepo")<CuratorRepo, {
    curate: (systemPrompt: string, insights: string[]) => Effect.Effect<typeof CuratedSchema.Type, Error, never>
}> () {}

export class AceRepo extends Context.Tag("AceRepo")<AceRepo, {
    optimize: (systemPrompt: string, prompt: string, maxIterations: number) => Effect.Effect<typeof AceResultSchema.Type, Error, GeneratorRepo | ReflectorRepo | CuratorRepo>
}> () {}

