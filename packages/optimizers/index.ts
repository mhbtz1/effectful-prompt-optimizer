import { Effect, Context, Layer } from 'effect';

const makeOptimizerService = Effect.gen(function* () {
    return {
        optimize: (prompt: string) => Effect.gen(function* () {
            return prompt;
        })
    }
})

class OptimizerService extends Context.Tag('OptimizerService')<OptimizerService, Effect.Effect.Success<typeof makeOptimizerService>>() {
    static readonly Live = Layer.effect(this, makeOptimizerService)
}

export { OptimizerService }