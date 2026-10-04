import type { Line } from '../types/lines';
import { LINE_OBJECTS } from '../constants/lines';

export const BASE_URL = 'https://dashboard.transitmatters.org';
const DEFAULT_DESCRIPTION =
  'Explore MBTA subway, commuter rail and bus performance data with the TransitMatters Data Dashboard.';

const linePathToKey: Record<string, Line> = {
  red: 'line-red',
  orange: 'line-orange',
  green: 'line-green',
  blue: 'line-blue',
  mattapan: 'line-mattapan',
  bus: 'line-bus',
  'commuter-rail': 'line-commuter-rail',
  ferry: 'line-ferry',
  'the-ride': 'line-RIDE',
};

const PAGE_DISPLAY_NAMES: Record<string, string> = {
  speed: 'Speed',
  service: 'Service',
  predictions: 'Predictions',
  delays: 'Delays',
  slowzones: 'Slow Zones',
  ridership: 'Ridership',
  reliability: 'Reliability',
};

function getPageName(pathname: string): string | undefined {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.includes('trips')) {
    const tripType = segments[segments.length - 1];
    if (tripType === 'single') return 'Trips';
    if (tripType === 'multi') return 'Multi-day Trips';
  }
  const lastSegment = segments[segments.length - 1];
  return PAGE_DISPLAY_NAMES[lastSegment];
}

/** `startCase(toLower(...))` of the path segment, matching how useDelimitatedRoute derives it. */
export function lineShortFor(linePath: string | undefined) {
  if (!linePath) return undefined;
  const words = linePath.replace('-', ' ').toLowerCase().split(' ');
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function dateSummary(query: Record<string, unknown>) {
  const { date, startDate, endDate } = query;
  if (typeof date === 'string') return ` on ${date}`;
  if (typeof startDate === 'string' && typeof endDate === 'string')
    return ` from ${startDate} to ${endDate}`;
  if (typeof startDate === 'string') return ` since ${startDate}`;
  return '';
}

export interface MetaTags {
  title: string;
  description: string;
  canonicalUrl: string;
}

/**
 * `trip` is the "Davis to Porter" summary for trip pages; it needs the station tables, so callers
 * that only know the path (the build-time prerender) leave it out.
 */
export function getMetaTags(
  pathname: string,
  query: Record<string, unknown> = {},
  trip?: string,
  searchStr = ''
): MetaTags {
  const linePath = pathname.split('/')[1];
  const lineKey = linePath ? linePathToKey[linePath] : undefined;
  const lineName = lineKey ? LINE_OBJECTS[lineKey]?.name : undefined;
  const pageName = getPageName(pathname);

  const title = [lineName, trip ?? pageName, 'Data Dashboard'].filter(Boolean).join(' | ');
  const description = trip
    ? `${trip}${dateSummary(query)} on the ${lineName ?? 'MBTA'}, from the TransitMatters Data Dashboard.`
    : lineName
      ? `${lineName} ${pageName?.toLowerCase() ?? 'performance'} data on the TransitMatters Data Dashboard.`
      : DEFAULT_DESCRIPTION;

  return { title, description, canonicalUrl: `${BASE_URL}${pathname}${searchStr}` };
}

/** The social-card tags, as [attribute, key, content] triples, shared by React and the prerender. */
export function getMetaTagEntries({ title, description, canonicalUrl }: MetaTags) {
  return [
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:type', 'website'],
    ['property', 'og:url', canonicalUrl],
    ['property', 'og:image', `${BASE_URL}/twitter-card.jpg`],
    ['property', 'og:site_name', 'TransitMatters Data Dashboard'],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:site', '@transitmatters'],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
    ['name', 'twitter:image', `${BASE_URL}/twitter-card.jpg`],
    ['name', 'description', description],
  ] as const;
}
