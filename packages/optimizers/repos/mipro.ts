import { Effect } from "effect"
import { DataSchema } from "../schemas/data.js"
import { ModuleService } from "../core/mipro.js"

const makeMIProRepo = Effect.gen(function* () {
    return {
        bootstrap: (
            student: ModuleService,
            trainset: DataSchema,
            teacher: ModuleService
        ) => Effect.succeed(1),

        optimize: (
            program: ModuleService,
            trainset: DataSchema
        ) => Effect.succeed(1)
    }
})



