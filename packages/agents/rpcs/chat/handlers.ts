import { Effect } from 'effect';
import { AgentRpcs } from './requests';
import { DataLayerRepo } from '../../../data';

export const AgentRpcsLive = AgentRpcs.toLayer({
    CreateAgent: (args: { name: string, description: string, userPrompt: string }) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.CreateAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live))
    },

    UpdateAgent: (args: { id: string, name: string, description: string, userPrompt: string }) => {

    },

    DeleteAgent: (args: { id: string }) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.DeleteAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live))
    },

    GetAgent: (args: { id: string }) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.GetAgent(args)
        }).pipe(Effect.provide(DataLayerRepo.Live))
    },
    
    ListAgents: (args: { }) => {
        return Effect.gen(function* () {
            const service = yield* DataLayerRepo;
            return yield* service.ListAgents(args)
        }).pipe(Effect.provide(DataLayerRepo.Live))
    },
    
    

})