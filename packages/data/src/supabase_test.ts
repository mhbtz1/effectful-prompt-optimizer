import { DataLayerRepo } from './data.js';
import { Effect } from 'effect';

const TestAdd = Effect.gen(function* () {
    const dataLayer = yield* DataLayerRepo;
    return yield* dataLayer.CreateAgent({
        name: 'Test Agent',
        originalPrompt: 'Test Agent User Prompt'
    })
}).pipe(Effect.provide(DataLayerRepo.Live))

Effect.runPromise(TestAdd)