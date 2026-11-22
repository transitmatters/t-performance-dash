import { APP_DATA_BASE_PATH } from '../../utils/constants';
import type { ApiPath, ApiResponse } from '../../types/apiSchemas';
import { fetchOrThrow } from './ApiError';

interface ApiFetchArgs<P extends ApiPath> {
  path: P;
  /** Values for the path's `{name}` segments. */
  pathParams?: Record<string, string>;
  options: Record<string, unknown>;
  errorMessage: string;
}

const buildUrl = (path: string, options: Record<string, unknown>) => {
  const url = new URL(`${APP_DATA_BASE_PATH}${path}`, window.location.origin);
  Object.entries(options).forEach(([key, value]) => {
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
}: ApiFetchArgs<P>): Promise<ApiResponse<P>> => {
  const resolvedPath = path.replace(/\{(\w+)\}/g, (_, name: string) => pathParams?.[name] ?? '');
  const response = await fetchOrThrow(
    buildUrl(resolvedPath, options).toString(),
    undefined,
    errorMessage
  );
  return await response.json();
};
