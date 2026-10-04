export const PRODUCTION = 'dashboard.transitmatters.org';
export const BETA = 'dashboard-beta.labs.transitmatters.org';
const BETA_API = 'https://dashboard-api-beta.labs.transitmatters.org';
const FRONTEND_TO_BACKEND_MAP = {
  [PRODUCTION]: 'https://dashboard-api.labs.transitmatters.org',
  [BETA]: BETA_API,
};

let domain = '';
if (typeof window !== 'undefined') {
  domain = window.location.hostname;
}
export const APP_DATA_BASE_PATH = FRONTEND_TO_BACKEND_MAP[domain] || '';

export const isBetaHost = () => domain === BETA;

// Datadog RUM runs on beta only. Prod uses GoatCounter so it needs no cookie notice.
// deploy.sh sets these for beta builds.
export const DD_RUM = {
  applicationId: process.env.NEXT_PUBLIC_DD_RUM_APPLICATION_ID,
  clientToken: process.env.NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN,
  tracedApi: BETA_API,
};
