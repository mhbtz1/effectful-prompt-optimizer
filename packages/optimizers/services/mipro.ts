import { Effect, Context, Layer } from 'effect';
import { DataSchema } from '../schemas/data.js';
import type { UnknownException } from 'effect/Cause';

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
