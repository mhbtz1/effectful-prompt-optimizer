import { FetchHttpClient } from '@effect/platform';
import { RpcClient, RpcSerialization } from '@effect/rpc';
import { Protocol } from '@effect/rpc/RpcClient';
import { Effect, Layer } from 'effect';
import { Scope } from 'effect/Scope';


/*
// this ensures that the client sends its cookies to our internal api endpoint
// this is necessary because the internal api endpoint will be hosted on a different domain

const credentialsIncludedClient = FetchHttpClient.layer.pipe(
  Layer.provide(
    Layer.succeed(FetchHttpClient.RequestInit, { credentials: 'include' }),
  ),
);
*/

// Get API URL from environment, fallback to localhost for development

export const rpc = (effect: Effect.Effect<any, any, Protocol | Scope>) => {
  const eff = effect.pipe(
    Effect.provide(
      RpcClient.layerProtocolHttp({
        url: `/rpc/agents`,
      }).pipe(
        Layer.provide([
          FetchHttpClient.layer,
          RpcSerialization.layerNdjson,
        ]),
      ),
    ),
    Effect.scoped,
  )
  return Effect.runPromise(eff)
}

export const unauthedRpc = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.provide(
      RpcClient.layerProtocolHttp({
        url: `/rpc/agents`,
      }).pipe(
        Layer.provide([
          FetchHttpClient.layer,
          RpcSerialization.layerNdjson,
        ]),
      ),
    ),
    Effect.scoped,
  );

export const streamRpc = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.provide(
      RpcClient.layerProtocolHttp({
        url: `/rpc/agents`,
      }).pipe(
        Layer.provide([
          FetchHttpClient.layer,
          RpcSerialization.layerNdjson,
        ]),
      ),
    ),
  );

export const conversationRpc = (effect: Effect.Effect<any, any, Protocol | Scope>) => {
  const eff = effect.pipe(
    Effect.provide(
      RpcClient.layerProtocolHttp({
        url: `/rpc/conversations`,
      }).pipe(
        Layer.provide([
          FetchHttpClient.layer,
          RpcSerialization.layerNdjson,
        ]),
      ),
    ),
    Effect.scoped,
  )
  return Effect.runPromise(eff)
}
