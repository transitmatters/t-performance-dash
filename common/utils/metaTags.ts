import { i18n } from '../i18n';
import type { Line } from '../types/lines';
import { LINE_OBJECTS } from '../constants/lines';
import { STATIC_PATHS } from '../constants/staticRoutes';

export const BASE_URL = 'https://dashboard.transitmatters.org';
// deploy.sh sets this so beta's link previews use beta's cards; prod and local builds use BASE_URL.
const IMAGE_ORIGIN = import.meta.env.VITE_FRONTEND_HOST
  ? `https://${import.meta.env.VITE_FRONTEND_HOST}`
  : BASE_URL;

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

// Path segments with a page name in titles and descriptions (`meta.pages.<segment>`).
const NAMED_PAGES = [
  'speed',
  'service',
  'predictions',
  'delays',
  'slowzones',
  'ridership',
  'reliability',
  'fleet',
  'leaderboard',
  'speedmap',
  'opensource',
] as const;
type NamedPage = (typeof NAMED_PAGES)[number] | 'trips' | 'multiTrips';

const TM_RED = '#a31e1e';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

function getPage(pathname: string): NamedPage | undefined {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.includes('trips')) {
    const tripType = segments[segments.length - 1];
    if (tripType === 'single') return 'trips';
    if (tripType === 'multi') return 'multiTrips';
  }
  const lastSegment = segments[segments.length - 1];
  return NAMED_PAGES.find((page) => page === lastSegment);
}

function getPageName(pathname: string): string | undefined {
  const page = getPage(pathname);
  return page && i18n.t(`meta.pages.${page}.title`);
}

/** `startCase(toLower(...))` of the path segment, matching how useDelimitatedRoute derives it. */
export function lineShortFor(linePath: string | undefined) {
  if (!linePath) return undefined;
  const words = linePath.replace('-', ' ').toLowerCase().split(' ');
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function tripDescription(trip: string, query: Record<string, unknown>, line: string) {
  const { date, startDate, endDate } = query;
  if (typeof date === 'string') return i18n.t('meta.description.tripOnDate', { trip, date, line });
  if (typeof startDate === 'string' && typeof endDate === 'string')
    return i18n.t('meta.description.tripDateRange', { trip, startDate, endDate, line });
  if (typeof startDate === 'string')
    return i18n.t('meta.description.tripSince', { trip, startDate, line });
  return i18n.t('meta.description.trip', { trip, line });
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
    lineName ??
    (segments[0] === 'system' ? i18n.t('meta.og.systemwide') : (pageName ?? i18n.t('app.name')));
  const subheading =
    lineName || segments[0] === 'system'
      ? (pageName ?? i18n.t('meta.og.overview'))
      : segments.length
        ? null
        : i18n.t('meta.og.tagline');
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
  const page = getPage(pathname);
  const pageName = getPageName(pathname);

  const title = [lineName, trip ?? pageName, i18n.t('app.name')].filter(Boolean).join(' | ');
  const description = trip
    ? tripDescription(trip, query, lineName ?? 'MBTA')
    : lineName
      ? i18n.t('meta.description.linePage', {
          line: lineName,
          page: page ? i18n.t(`meta.pages.${page}.inSentence`) : i18n.t('meta.performance'),
        })
      : i18n.t('meta.description.default');

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
    ['property', 'og:site_name', i18n.t('meta.siteName')],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:site', '@transitmatters'],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
    ['name', 'twitter:image', image],
    ['name', 'twitter:image:alt', title],
    ['name', 'description', description],
  ] as const;
}
