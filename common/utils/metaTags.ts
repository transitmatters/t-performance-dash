import type { Line } from '../types/lines';
import { LINE_OBJECTS } from '../constants/lines';
import { STATIC_PATHS } from '../constants/staticRoutes';

export const BASE_URL = 'https://dashboard.transitmatters.org';
// deploy.sh sets this so beta's link previews use beta's cards; prod and local builds use BASE_URL.
const IMAGE_ORIGIN = import.meta.env.VITE_FRONTEND_HOST
  ? `https://${import.meta.env.VITE_FRONTEND_HOST}`
  : BASE_URL;
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
  fleet: 'Fleet',
  leaderboard: 'Leaderboard',
  speedmap: 'Speed Map',
  opensource: 'Open Source',
};

const TM_RED = '#a31e1e';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

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
  image: string;
}

/** `/` -> `index`, `/red/` -> `red`, `/red/trips/single/` -> `red/trips/single`. */
export function ogImageSlug(pathname: string) {
  return pathname.split('/').filter(Boolean).join('/') || 'index';
}

/** The card the backend renders to `static/og/<slug>.png` for each prerendered path. */
export interface OgCard {
  slug: string;
  path: string;
  lineKey: Line | null;
  /** The path below the line (`slowzones`, `trips/single`, `''` for the overview), or the whole path off a line. */
  page: string;
  heading: string;
  subheading: string | null;
  color: string;
}

export function getOgCard(pathname: string): OgCard {
  const segments = pathname.split('/').filter(Boolean);
  const lineKey = segments[0] ? (linePathToKey[segments[0]] ?? null) : null;
  const lineName = lineKey ? LINE_OBJECTS[lineKey].name : undefined;
  const pageName = getPageName(pathname);
  const heading =
    lineName ?? (segments[0] === 'system' ? 'Systemwide' : (pageName ?? 'Data Dashboard'));
  const subheading =
    lineName || segments[0] === 'system'
      ? (pageName ?? 'Overview')
      : segments.length
        ? null
        : 'MBTA subway, bus and commuter rail performance';
  return {
    slug: ogImageSlug(pathname),
    path: pathname,
    lineKey,
    page: (lineKey ? segments.slice(1) : segments).join('/'),
    heading,
    subheading: subheading === heading ? null : subheading,
    color: lineKey ? LINE_OBJECTS[lineKey].color : TM_RED,
  };
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

  // Only prerendered paths get a generated card. 404s use the one in public/, which doesn't depend
  // on the card job having run.
  const hasCard = STATIC_PATHS.includes(pathname.endsWith('/') ? pathname : `${pathname}/`);
  return {
    title,
    description,
    canonicalUrl: `${BASE_URL}${pathname}${searchStr}`,
    image: hasCard
      ? `${IMAGE_ORIGIN}/static/og/${ogImageSlug(pathname)}.png`
      : `${IMAGE_ORIGIN}/og-card.png`,
  };
}

/** The social-card tags, as [attribute, key, content] triples, shared by React and the prerender. */
export function getMetaTagEntries({ title, description, canonicalUrl, image }: MetaTags) {
  return [
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:type', 'website'],
    ['property', 'og:url', canonicalUrl],
    ['property', 'og:image', image],
    ['property', 'og:image:width', String(OG_IMAGE_WIDTH)],
    ['property', 'og:image:height', String(OG_IMAGE_HEIGHT)],
    ['property', 'og:image:alt', title],
    ['property', 'og:site_name', 'TransitMatters Data Dashboard'],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:site', '@transitmatters'],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
    ['name', 'twitter:image', image],
    ['name', 'twitter:image:alt', title],
    ['name', 'description', description],
  ] as const;
}
