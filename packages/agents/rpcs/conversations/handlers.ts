import { Effect } from 'effect';
import { ConversationRpcs } from './requests.js';
import { ConversationDataLayerRepo } from '../../../data/src/conversations/data.js';

export const ConversationRpcsLive = ConversationRpcs.toLayer({
    CreateConversation: (args: { title: string, description: string }) => {
        return Effect.gen(function* () {
            const service = yield* ConversationDataLayerRepo;
            const result = yield* service.CreateConversation(args);
            return result;
        }).pipe(
            Effect.provide(ConversationDataLayerRepo.Live),
            Effect.withSpan('CreateConversation'),
            Effect.tapError(error => Effect.logError(error)),
            Effect.tapErrorCause(Effect.logError)
        );
    },

    ListConversations: () => {
        return Effect.gen(function* () {
            const service = yield* ConversationDataLayerRepo;
            return yield* service.ListConversations();
        }).pipe(
            Effect.tap((result) => Effect.logInfo(`ListConversations result: ${JSON.stringify(result)}`)),
            Effect.provide(ConversationDataLayerRepo.Live),
            Effect.withSpan('ListConversations')
        );
    },

    GetConversation: (args: { conversationId: string }) => {
        return Effect.gen(function* () {
            const service = yield* ConversationDataLayerRepo;
            return yield* service.GetConversation(args);
        }).pipe(
            Effect.provide(ConversationDataLayerRepo.Live),
            Effect.withSpan('GetConversation')
        );
    },

    GetConversationMessages: (args: { conversationId: string }) => {
        return Effect.gen(function* () {
            const service = yield* ConversationDataLayerRepo;
            return yield* service.GetConversationMessages(args);
        }).pipe(
            Effect.provide(ConversationDataLayerRepo.Live),
            Effect.withSpan('GetConversationMessages')
        );
    },
});
