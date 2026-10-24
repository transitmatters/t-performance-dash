import { APP_DATA_BASE_PATH } from '../../utils/constants';
import { fetchOrThrow } from './ApiError';

export const apiFetch = async ({ path, options, errorMessage }) => {
  const url = new URL(`${APP_DATA_BASE_PATH}${path}`, window.location.origin);
  Object.entries(options).forEach(([key, value]: [string, any]) => {
    url.searchParams.append(key, value.toString());
  });
  const response = await fetchOrThrow(url.toString(), undefined, errorMessage);
  return await response.json();
};
