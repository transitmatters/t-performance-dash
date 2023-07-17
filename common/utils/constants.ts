export const PRODUCTION = 'dashboard.transitmatters.org';
export const BETA = 'dashboard-beta.labs.transitmatters.org';
const FRONTEND_TO_BACKEND_MAP = {
  [PRODUCTION]: 'https://dashboard-api.labs.transitmatters.org',
  [BETA]: 'https://dashboard-api-beta.labs.transitmatters.org',
};

let domain = '';
if (typeof window !== 'undefined') {
  domain = window.location.hostname;
}
export const APP_DATA_BASE_PATH = FRONTEND_TO_BACKEND_MAP[domain] || '';
