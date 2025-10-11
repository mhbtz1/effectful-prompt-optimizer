import type {
    DefaultError,
    MutateOptions,
    QueryFunctionContext,
    QueryKey,
    SkipToken,
    UseMutationOptions,
    UseMutationResult,
    UseQueryOptions,
    UseQueryResult,
    UseSuspenseQueryOptions,
    UseSuspenseQueryResult,
} from '@tanstack/react-query';
import { Effect, Cause, Either, Exit } from 'effect';
import {
    Config,
    type ConfigError,
    Context,
    Data,
    Layer,
    ManagedRuntime,
} from 'effect';


type Override<TTargetA, TTargetB> = {
    [AKey in keyof TTargetA]: AKey extends keyof TTargetB
      ? TTargetB[AKey]
      : TTargetA[AKey];
  };

export class SupabaseSessionError extends Data.TaggedError(
  '@markprompt/SupabaseSessionError',
)<{
  cause: unknown;
}> {}

type UseEffectQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  ThrowOnDefect extends boolean = false,
  TExposedError = ThrowOnDefect extends true ? TError : Cause.Cause<TError>,
> = {
  throwOnDefect?: ThrowOnDefect;
} & Override<
  Omit<
    UseQueryOptions<TQueryFnData, TExposedError, TData, TQueryKey>,
    'retry' | 'retryDelay'
  >,
  {
    queryFn?:
      | ((
          context: QueryFunctionContext<TQueryKey, never>,
        ) => Effect.Effect<TQueryFnData, TError>)
      | SkipToken;
  }
>;

export function useEffectQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  ThrowOnDefect extends boolean = false,
  TExposedError = ThrowOnDefect extends true ? TError : Cause.Cause<TError>,
>(
  options: UseEffectQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    ThrowOnDefect,
    TExposedError
  >,
): UseQueryResult<TData, TExposedError> {
  const throwOnDefect = options.throwOnDefect ?? false;

  const runtime = useEffectRuntime();

  const { queryFn, throwOnError, ...opts } = options;

  const baseResults = useQuery({
    ...opts,
    refetchInterval: (query) => {
      const interval =
        typeof opts.refetchInterval === 'function'
          ? opts.refetchInterval(query)
          : opts.refetchInterval;
      if (interval === false || interval === undefined) {
        return interval;
      }

      const hasPendingMutations =
        queryClient.isMutating({
          mutationKey: query.queryKey,
        }) > 0;

      return interval > 0 && hasPendingMutations ? false : interval;
    },
    queryFn:
      typeof queryFn === 'function'
        ? async (args) => {
            let queryEffect: Effect.Effect<
              TQueryFnData,
              TError,
            >;
            try {
              queryEffect = queryFn(args);
            } catch (e) {
              console.error(
                'queryFn threw',
                (typeof e === 'object' &&
                  e !== null &&
                  'message' in e &&
                  e.message) ??
                  '',
                e,
              );
              throw new Cause.UnknownException(e, 'queryFn threw');
            }

            const effectToRun = queryEffect.pipe(
              Effect.withSpan('useEffectQuery', {
                attributes: {
                  queryKey: args.queryKey,
                  queryFn: queryFn.toString(),
                },
              }),
            );

            const result = await runtime.runPromiseExit(effectToRun, {
              signal: args.signal,
            });
            if (Exit.isFailure(result)) {
              // we always throw the cause
              throw result.cause;
            }
            return result.value;
          }
        : queryFn,
    throwOnError:
      typeof throwOnError === 'function'
        ? (error, query) => {
            // this is safe because internally when we call useQuery we always throw the full cause or UnknownException
            const cause = error as Cause.Cause<TError> | Cause.UnknownException;

            // if the cause is UnknownException, we always return true and throw it
            if (Cause.isUnknownException(cause)) {
              return true;
            }
            const failureOrCause = Cause.failureOrCause(cause);

            if (throwOnDefect) {
              // in this case options.throwOnError expects a TError

              // the cause was a fail, so we have TError
              if (Either.isLeft(failureOrCause)) {
                // this is safe because if throwOnDefect is true then TExposedError is TError
                const exposedError =
                  failureOrCause.left as unknown as TExposedError;
                return throwOnError(exposedError, query);
              }
              // the cause was a die or interrupt, so we return true
              return true;
            }
            // in this case options.throwOnError expects a Cause<TError>
            // this is safe because if throwOnDefect is false then TExposedError is Cause<TError>
            const exposedError = cause as unknown as TExposedError;
            return throwOnError(exposedError, query);
          }
        : throwOnError,
  });

  // the results from react query all have getters which trigger fine grained tracking, we need to replicate this when we wrap the results
  const resultsProxy = new Proxy(baseResults, {
    get: (target, prop, receiver) => {
      if (prop === 'error') {
        return target.error
          ? throwOnDefect
            ? Either.match(
                Cause.failureOrCause(
                  target.error as unknown as Cause.Cause<TError>, // this is safe because we always throw the full cause and we know that error is not null
                ),
                {
                  onLeft: (error) => error as unknown as TExposedError, // if throwOnDefect is true then TExposedError is TError
                  onRight: (_cause) => {
                    throw new Error(
                      'non fail cause with throwOnDefect: true should have thrown already',
                    );
                  },
                },
              )
            : target.error // if throwOnDefect is false then TExposedError is Cause<TError>, and base error is always Cause<TError>
          : null;
      }
      if (prop === 'failureReason') {
        return target.failureReason
          ? throwOnDefect
            ? Either.match(
                Cause.failureOrCause(
                  target.failureReason as unknown as Cause.Cause<TError>, // this is safe because we always throw the full cause and we know that error is not null
                ),
                {
                  onLeft: (error) => error as unknown as TExposedError, // if throwOnDefect is true then TExposedError is TError
                  onRight: (_cause) => {
                    throw new Error(
                      'non fail cause with throwOnDefect: true should have thrown already',
                    );
                  },
                },
              )
            : target.failureReason // if throwOnDefect is false then TExposedError is Cause<TError>, and base error is always Cause<TError>
          : null;
      }

      return Reflect.get(target, prop, receiver);
    },
  });

  return resultsProxy as UseQueryResult<TData, TExposedError>;
  // this is safe because we are only doing very light remapping
  // it gets mad when you touch error because it is either TError or null depending on other properities, but we honor those cases
}