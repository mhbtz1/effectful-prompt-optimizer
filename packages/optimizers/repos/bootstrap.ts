import { Effect, Layer } from 'effect'
import { BootstrappingRepo, type ModuleServiceProps } from '../services/all-services.js'
import { DataSchema } from '../schemas/data.js'


export const makeBootstrappingRepo = Layer.succeed(BootstrappingRepo, {
    bootstrap: (
        program: ModuleServiceProps,
        trainset: DataSchema,
    ) => {
        return Effect.gen(function* () {
            const batches = new Map<number, any[]>();

            for (const data of trainset) {
                const input = data.input;
                const output = data.output;
                const response = yield* program.predict(input);
                const value = Math.floor(Math.random() * 10);
                console.log(`Inserting response ${JSON.stringify(response)} into batch ${value}`)
                batches.set(value, [...(batches.get(value) || []), response]);
            }
            return batches;
        })
    }
})