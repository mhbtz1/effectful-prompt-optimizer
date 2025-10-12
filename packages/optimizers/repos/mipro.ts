import { Effect, Layer } from "effect"
import { DataSchema } from "../schemas/data.js"
import { BootstrappingRepo, ModuleService, type ModuleServiceProps } from "../services/mipro.js"
import { OptimizerRepo } from "../index.js"


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
        bootstrap: (
            student: ModuleServiceProps,
            teacher: ModuleServiceProps,
            program: ModuleServiceProps,
            trainset: DataSchema
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
        },

        optimize: (
            program: ModuleServiceProps,
            trainset: DataSchema,
            bootstrapper: BootstrappingRepoProps
        ) => {


            return Effect.gen(function* () {
                const programService = yield* ModuleService;
                // use program for optimization
                const response = yield* programService.predict(prompt)
            })
        }
})



