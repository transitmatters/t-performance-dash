import type { HomeData } from '../../modules/home/types';

/** The home page scoreboard, built and published daily by data-ingestion. */
export const fetchOverview = async (): Promise<HomeData> => {
  const url = new URL('/static/landing/overview.json', window.location.origin);
  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`overview.json: ${resp.status}`);
  const overview = await resp.json();
  if (overview?.schemaVersion !== 1) throw new Error('overview.json: unknown schema version');
  return overview;
};
