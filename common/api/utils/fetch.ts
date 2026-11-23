import { APP_DATA_BASE_PATH } from '../../utils/constants';
import type { ApiPath, ApiPathParams, ApiQuery, ApiResponse } from '../../types/apiSchemas';
import { fetchOrThrow } from './ApiError';

type ApiFetchArgs<P extends ApiPath> = {
  path: P;
  // `& object` lets the body list a route's parameters; unlike a Record, it still rejects unknown ones.
  options: ApiQuery<P> & object;
  errorMessage: string;
  signal?: AbortSignal;
} & ([ApiPathParams<P>] extends [never]
  ? { pathParams?: undefined }
  : { /** Values for the path's `{name}` segments. */ pathParams: ApiPathParams<P> });

const buildUrl = (path: string, options: object) => {
  const url = new URL(`${APP_DATA_BASE_PATH}${path}`, window.location.origin);
  const entries: [string, unknown][] = Object.entries(options);
  entries.forEach(([key, value]) => {
    // An array is sent as a repeated parameter (`route=a&route=b`).
    const values: unknown[] = Array.isArray(value) ? value : [value];
    values.forEach((item) => {
      if (item !== undefined) url.searchParams.append(key, String(item));
    });
  });
  return url;
};

/**
 * GETs an API route, typed by its response schema in `server/openapi.json`. The body isn't checked
 * at runtime: the types catch the frontend drifting from the spec, not the server breaking it.
 */
export const apiFetch = async <P extends ApiPath>({
  path,
  pathParams,
  options,
  errorMessage,
  signal,
}: ApiFetchArgs<P>): Promise<ApiResponse<P>> => {
  const segments = new Map<string, unknown>(Object.entries(pathParams ?? {}));
  const resolvedPath = path.replace(/\{(\w+)\}/g, (_, name: string) =>
    String(segments.get(name) ?? '')
  );
  const response = await fetchOrThrow(
    buildUrl(resolvedPath, options).toString(),
    { signal },
    errorMessage
  );
  return await response.json();
};
