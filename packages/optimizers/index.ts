import { Effect, Context, Layer } from 'effect';
import { ModuleService } from './services/mipro.js';

const makeOptimizerService = Effect.gen(function* () {
})

class OptimizerRepo extends Context.Tag('OptimizerService')<OptimizerRepo, {
    optimize: (prompt: string, student: ModuleService, teacher: ModuleService) => Effect.Effect<number>
}> () {}

export { OptimizerRepo }