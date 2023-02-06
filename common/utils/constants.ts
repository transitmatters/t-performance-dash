export const PRODUCTION = 'dashboard-v4.transitmatters.org';
export const BETA = 'dashboard-v4-beta.labs.transitmatters.org';
const FRONTEND_TO_BACKEND_MAP = {
  [PRODUCTION]: 'https://dashboard-v4-api.transitmatters.org',
  [BETA]: 'https://dashboard-v4-beta-api.labs.transitmatters.org',
};

let domain = '';
if (typeof window !== 'undefined') {
  domain = window.location.hostname;
}
export const APP_DATA_BASE_PATH = FRONTEND_TO_BACKEND_MAP[domain] || '';
