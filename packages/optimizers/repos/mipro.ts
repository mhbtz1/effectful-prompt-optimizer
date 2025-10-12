import { Effect, Layer } from "effect"
import { DataSchema } from "../schemas/data.js"
import { BootstrappingRepo, OptimizerRepo, ModuleService, type ModuleServiceProps, type BootstrappingRepoProps, type OptimizerRepoProps } from "../services/mipro.js"


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
                batches.set(value, [...(batches.get(value) || []), response]);
            }
            return batches;
        })
    }
})

export const makeMIProRepo = Layer.succeed(OptimizerRepo, {
        optimize: (
            prompt: string,
            student: ModuleServiceProps,
            teacher: ModuleServiceProps,
            trainset?: DataSchema
        ) => {
            return Effect.succeed({response: "1", score: 1})
        }
})



