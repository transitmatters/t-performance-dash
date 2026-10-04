import { DD_RUM, isBetaHost } from './constants';

let started = false;

export const initBetaRum = async () => {
  const { applicationId, clientToken } = DD_RUM;
  if (started || !isBetaHost() || !applicationId || !clientToken) return;
  started = true;

  // Loaded on demand so prod and local never download the SDK.
  const { datadogRum } = await import('@datadog/browser-rum');
  datadogRum.init({
    applicationId,
    clientToken,
    site: 'datadoghq.com',
    service: 't-performance-dash',
    env: 'beta',
    version: process.env.NEXT_PUBLIC_GIT_VERSION,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 0,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
    allowedTracingUrls: [DD_RUM.tracedApi],
  });
};
