import type { HomeData } from '../../modules/home/types';

// Checks only the version; the rest of the file is trusted.
const isHomeData = (value: unknown): value is HomeData =>
  typeof value === 'object' &&
  value !== null &&
  'schemaVersion' in value &&
  value.schemaVersion === 1;

/** The home page scoreboard, built and published daily by data-ingestion. */
export const fetchOverview = async (): Promise<HomeData> => {
  const url = new URL('/static/landing/overview.json', window.location.origin);
  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`overview.json: ${resp.status}`);
  const overview: unknown = await resp.json();
  if (!isHomeData(overview)) throw new Error('overview.json: unknown schema version');
  return overview;
};
