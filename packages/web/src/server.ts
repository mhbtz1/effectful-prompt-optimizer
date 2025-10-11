import { Effect, pipe} from 'effect';
import { HttpMiddleware, HttpRouter, HttpServerRequest, HttpServerResponse } from '@effect/platform';
import { RpcServer, RpcSerialization } from '@effect/rpc';

import { AgentRpcs } from '../../agents/rpcs/chat/requests.js';
import { AgentRpcsLive } from '../../agents/rpcs/chat/handlers.js';
import { DataLayerRepo } from '../../data/src/data.js';

const corsMiddleware = HttpMiddleware.make((app) =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const response = yield* app;
  
      return response.pipe(
        HttpServerResponse.setHeader('Access-Control-Allow-Origin', '*'),
        HttpServerResponse.setHeader('Access-Control-Allow-Credentials', 'true'),
        HttpServerResponse.setHeader(
          'Access-Control-Allow-Headers',
          'traceparent, content-type, b3',
        ),
      );
    }),
);

const middleware = pipe(corsMiddleware)

const optionsResponse = Effect.gen(function* () {
    const response = yield* HttpServerResponse.empty({
        status: 204
    })
    return response
})

const OPTIONRoutes = HttpRouter.empty.pipe(
    HttpRouter.options("/rpc/chat", optionsResponse),
    HttpRouter.options("/rpc/optimize", optionsResponse),
    HttpRouter.options("/rpc/agents", optionsResponse)
)

const POSTRoutes = HttpRouter.empty.pipe(
  HttpRouter.post("/rpc/agents", RpcServer.toHttpApp(AgentRpcs).pipe(
      Effect.provide(AgentRpcsLive),
      Effect.provide(DataLayerRepo.Live),
      Effect.provide(RpcSerialization.layerNdjson),
      Effect.flatten))
)

export const server = HttpRouter.concatAll(OPTIONRoutes, POSTRoutes).pipe(middleware)