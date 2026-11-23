import type { components, paths } from './generated/api';

/** Every schema in `server/openapi.json`, e.g. `Schemas['HeadwayEvent']`. */
export type Schemas = components['schemas'];

/** A GET route as the spec writes it, with any path parameter in braces: `/api/stops/{route_id}`. */
export type ApiPath = {
  [P in keyof paths]: paths[P] extends { get: unknown } ? P : never;
}[keyof paths];

type QueryOf<P extends ApiPath> = paths[P]['get']['parameters'] extends { query?: infer Query }
  ? Exclude<Query, undefined>
  : never;

/** The query parameters a GET route takes; a route that takes none takes an empty object. */
export type ApiQuery<P extends ApiPath> = [QueryOf<P>] extends [never]
  ? Record<string, never>
  : QueryOf<P>;

/** The JSON body a GET route returns on success. */
export type ApiResponse<P extends ApiPath> =
  paths[P]['get']['responses'][200]['content']['application/json'];

/** Every field present, for a fetcher that fills in the ones the server can omit (usually with null). */
export type Filled<T> = { [K in keyof T]-?: Exclude<T[K], undefined> };
