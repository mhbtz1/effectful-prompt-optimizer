import { Effect, Context, Layer } from 'effect';
import { DataSchema } from '../schemas/data.js';

export class ModuleService extends Context.Tag('ProgramService')<ModuleService, {
    predict: (
        signature: string
    ) => Effect.Effect<string>,
}> () {
   
}

export class OptimizerService extends Context.Tag('Optimizer')<OptimizerService, {
    bootstrap: (
        student: Effect.Effect<ModuleService>,
        trainset: DataSchema,
        teacher: Effect.Effect<ModuleService>
    ) => Effect.Effect<void>

    optimize: (
        program: Effect.Effect<ModuleService>,
        trainset: DataSchema
    ) => Effect.Effect<number>
}> () {}


export class OptimizerRepo extends Context.Tag('OptimizerService')<OptimizerRepo, {
    optimize: (prompt: string, student: ModuleService, teacher: ModuleService) => Effect.Effect<number>
}> () {}

