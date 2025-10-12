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
        student: ModuleService,
        trainset: DataSchema,
        teacher: ModuleService
    ) => Effect.Effect<void>

    optimize: (
        program: ModuleService,
        trainset: DataSchema
    ) => Effect.Effect<number>
}> () {}

