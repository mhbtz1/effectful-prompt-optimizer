import { Effect, Layer } from "effect"
import { DataSchema } from "../schemas/data.js"
import { BootstrappingRepo, OptimizerRepo, ModuleService, type ModuleServiceProps, type BootstrappingRepoProps, type OptimizerRepoProps } from "../services/all-services.js"
import { makeBootstrappingRepo } from "./bootstrap.js"

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



