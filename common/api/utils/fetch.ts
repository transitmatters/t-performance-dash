import { APP_DATA_BASE_PATH } from '../../utils/constants';
import { fetchOrThrow } from './ApiError';

interface ApiFetchArgs {
  path: string;
  options: Record<string, unknown>;
  errorMessage: string;
}

export const apiFetch = async ({ path, options, errorMessage }: ApiFetchArgs) => {
  const url = new URL(`${APP_DATA_BASE_PATH}${path}`, window.location.origin);
  Object.entries(options).forEach(([key, value]) => {
    // An array is sent as a repeated parameter (`route=a&route=b`).
    const values: unknown[] = Array.isArray(value) ? value : [value];
    values.forEach((item) => {
      if (item !== undefined) url.searchParams.append(key, String(item));
    });
  });
  const response = await fetchOrThrow(url.toString(), undefined, errorMessage);
  return await response.json();
};
