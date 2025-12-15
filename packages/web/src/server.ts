import { Effect, Layer, pipe} from 'effect';
import { HttpMiddleware, HttpRouter, HttpServerRequest, HttpServerResponse } from '@effect/platform';
import { RpcServer, RpcSerialization } from '@effect/rpc';

import { HttpServer } from '@effect/platform';
import { NodeHttpServer, NodeRuntime } from '@effect/platform-node';
import { createServer } from 'node:http';

import { AgentRpcs } from '../../agents/rpcs/chat/requests.js';
import { AgentRpcsLive } from '../../agents/rpcs/chat/handlers.js';
import { ConversationRpcs } from '../../agents/rpcs/conversations/requests.js';
import { ConversationRpcsLive } from '../../agents/rpcs/conversations/handlers.js';
import { DataLayerRepo } from '../../data/src/data.js';
import { ConversationDataLayerRepo } from '../../data/src/conversations/data.js';
import { makeMIProRepo } from '../../optimizers/repos/mipro.js';
import { makeBootstrappingRepo } from '../../optimizers/repos/bootstrap.js';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
console.log(process.env)

// Allow specific origins or all origins for development
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'https://effectful-prompt-optimizer.onrender.com'];

const corsMiddleware = HttpMiddleware.make((app) =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const origin = (request.headers['origin'] as string | undefined) || '';
      const response = yield* app;
      
      // Check if origin is allowed
      let allowedOrigin: string;
      if (ALLOWED_ORIGINS.includes('*')) {
        allowedOrigin = '*';
      } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
        allowedOrigin = origin;
      } else {
        allowedOrigin = ALLOWED_ORIGINS[0] || '*';
      }
  
      return response.pipe(
        HttpServerResponse.setHeader('Access-Control-Allow-Origin', allowedOrigin),
        HttpServerResponse.setHeader('Access-Control-Allow-Credentials', 'true'),
        HttpServerResponse.setHeader(
          'Access-Control-Allow-Headers',
          'traceparent, content-type, b3',
        ),
        HttpServerResponse.setHeader(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        ),
        HttpServerResponse.setHeader('Access-Control-Max-Age', '86400'),
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
    HttpRouter.options("/rpc/agents", optionsResponse),
    HttpRouter.options("/rpc/conversations", optionsResponse)
)

const POSTRoutes = HttpRouter.empty.pipe(
  HttpRouter.post("/rpc/agents", RpcServer.toHttpApp(AgentRpcs).pipe(
      Effect.provide(AgentRpcsLive),
      Effect.provide(DataLayerRepo.Live),
      Effect.provide(RpcSerialization.layerNdjson),
      Effect.provide(makeMIProRepo),
      Effect.provide(makeBootstrappingRepo),
      Effect.flatten)),
  HttpRouter.post("/rpc/conversations", RpcServer.toHttpApp(ConversationRpcs).pipe(
      Effect.provide(ConversationRpcsLive),
      Effect.provide(ConversationDataLayerRepo.Live),
      Effect.provide(RpcSerialization.layerNdjson),
      Effect.flatten))
)

export const server = HttpRouter.concatAll(OPTIONRoutes, POSTRoutes).pipe(middleware)

const HttpLive = HttpServer.serve(server).pipe(HttpServer.withLogAddress, Layer.provide(NodeHttpServer.layer(createServer, {port: 3000 })))
NodeRuntime.runMain(Layer.launch(HttpLive))