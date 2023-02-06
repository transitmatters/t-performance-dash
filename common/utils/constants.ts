import type { Line, LineMap } from '../../common/types/stations';
import stations_json from '../../common/constants/stations.json';

export const stations: { [key in Line]: LineMap } = stations_json;

export const PRODUCTION = 'dashboard-v4.transitmatters.org';
export const BETA = 'dashboard-v4-beta.labs.transitmatters.org';
const FRONTEND_TO_BACKEND_MAP = {
  PRODUCTION: 'https://dashboard-v4-api.transitmatters.org',
  BETA: 'https://dashboard-v4-beta-api.labs.transitmatters.org',
};
let index = '';
// This is to prevent a next js render error https://nextjs.org/docs/messages/prerender-error
if (typeof window !== 'undefined') {
  index = window.location.hostname;
}
export const APP_DATA_BASE_PATH = FRONTEND_TO_BACKEND_MAP[index];
