import { Effect } from "effect"
import { DataSchema } from "../schemas/data.js"
import { ModuleService } from "../services/mipro.js"

const makeMIProRepo = Effect.gen(function* () {
    return {
        bootstrap: (
            student: Effect.Effect<ModuleService>,
            trainset: DataSchema,
            teacher: Effect.Effect<ModuleService>
        ) => Effect.succeed(1),

        optimize: (
            program: Effect.Effect<ModuleService>,
            trainset: DataSchema
        ) => {
            return Effect.gen(function* () {
                const programService = yield* program;
                // use program for optimization
            })

        }
    }
})



