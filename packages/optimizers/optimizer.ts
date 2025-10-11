import { OptimizerService } from './mipro_v2/index.js';
import { Effect } from 'effect';

const optimizer = Effect.gen(function* () {
    const optimizerService = yield* OptimizerService;
    return optimizerService.optimize("What is the capital of France?");
})

export { optimizer }