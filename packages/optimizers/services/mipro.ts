import { Effect, Context, Layer } from 'effect';
import { DataSchema } from '../schemas/data.js';
import type { UnknownException } from 'effect/Cause';

export interface ModuleServiceProps {
    predict: (prompt: string) => Effect.Effect<number, UnknownException>
}

export interface BootstrappingRepoProps {
    bootstrap: (
        program: ModuleServiceProps,
        trainset: DataSchema,
    ) => Effect.Effect<Map<number, any[]>, never>
}

export interface OptimizerServiceProps {
    optimize: (
        student: ModuleServiceProps,
        teacher: ModuleServiceProps,
        trainset: DataSchema,
        bootstrapper: BootstrappingRepoProps
    ) => Effect.Effect<number, UnknownException>
}

export class ModuleService extends Context.Tag('ModuleService')<ModuleService, ModuleServiceProps> () {}

export class OptimizerService extends Context.Tag('OptimizerService')<OptimizerService, OptimizerServiceProps> () {}

export class BootstrappingRepo extends Context.Tag('BootstrappingRepo')<BootstrappingRepo, {
    bootstrap: (
        student: ModuleServiceProps,
        trainset: DataSchema,
        teacher: ModuleServiceProps
    ) => Effect.Effect<Map<number, any[]>>
}> () {}

export class OptimizerRepo extends Context.Tag('OptimizerService')<OptimizerRepo, {
    optimize: (prompt: string, student: ModuleServiceProps, teacher: ModuleServiceProps) => Effect.Effect<number>
}> () {}

