import { Effect, Context, Layer } from 'effect';
import { ModuleService, type ModuleServiceProps } from './services/mipro.js';

const makeOptimizerService = Effect.gen(function* () {
})

class OptimizerRepo extends Context.Tag('OptimizerService')<OptimizerRepo, {
    optimize: (prompt: string, student: ModuleServiceProps, teacher: ModuleServiceProps) => Effect.Effect<number>
}> () {}

export { OptimizerRepo }