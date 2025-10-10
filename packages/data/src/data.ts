import { Effect, Layer} from 'effect';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

const makeDataLayer = Effect.gen(function* () {
    return {
        CreateAgent: (args: { name: string, description: string, userPrompt: string }) => Effect.gen(function* (){
            return yield* Effect.tryPromise(async () => supabaseClient.from('agents').insert({
                name: args.name,
                description: args.description,
                userPrompt: args.userPrompt
            })).pipe(
                Effect.flatMap(output => {
                    if (!output.error) {
                        return Effect.succeed({key: "success" as const, value: output.data!})
                    }
                    return Effect.fail({key: "error" as const, value: "1"})
                }),
                Effect.catchAll(error => Effect.fail({key: "error" as const, value: "0"}))
            )
            

        }),
        ToggleAgent: (args: { id: string, name: string, description: string, userPrompt: string }) => Effect.gen(function* (){
            const output = Effect.tryPromise(async () => supabaseClient.from('agents').update({
                name: args.name,
                description: args.description,
                userPrompt: args.userPrompt
            }))
            return output
        })
    }
})

export class DataLayerRepo extends Effect.Tag('DataLayerRepo')<DataLayerRepo, Effect.Effect.Success<typeof makeDataLayer>>() {
    static readonly Live = Layer.effect(this, makeDataLayer)
}

export const DataLayer = Effect.serviceFunctions(DataLayerRepo)


