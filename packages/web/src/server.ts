import { Effect } from 'effect';
import { HttpMiddleware, HttpRouter, HttpServerRequest, HttpServerResponse } from '@effect/platform';



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

const optionsResponse = Effect.gen(function* () {
    const response = yield* HttpServerResponse.empty({
        status: 204
    })
    return response
})

const routes = HttpRouter.empty.pipe(
    HttpRouter.options("/rpc/chat", optionsResponse),
)