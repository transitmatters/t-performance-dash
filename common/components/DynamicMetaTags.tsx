import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { Line, LinePath } from '../types/lines';
import { LINE_OBJECTS } from '../constants/lines';
import { getParentStationForStopId } from '../utils/stations';

const BASE_URL = 'https://dashboard.transitmatters.org';
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
function lineShortFor(linePath: string | undefined) {
  if (!linePath) return undefined;
  const words = linePath.replace('-', ' ').toLowerCase().split(' ');
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** "Davis to Porter", when both stops resolve. Stop ids alone would say nothing to a reader. */
function getTripSummary(query: Record<string, unknown>, lineShort: string | undefined) {
  const from = typeof query.from === 'string' ? query.from : undefined;
  const to = typeof query.to === 'string' ? query.to : undefined;
  if (!from || !to) return undefined;
  try {
    const fromStation = getParentStationForStopId(from, lineShort as never);
    const toStation = getParentStationForStopId(to, lineShort as never);
    if (!fromStation?.stop_name || !toStation?.stop_name) return undefined;
    return `${fromStation.stop_name} to ${toStation.stop_name}`;
  } catch {
    return undefined;
  }
}

function dateSummary(query: Record<string, unknown>) {
  const { date, startDate, endDate } = query;
  if (typeof date === 'string') return ` on ${date}`;
  if (typeof startDate === 'string' && typeof endDate === 'string')
    return ` from ${startDate} to ${endDate}`;
  if (typeof startDate === 'string') return ` since ${startDate}`;
  return '';
}

export const DynamicMetaTags: React.FC = () => {
  const router = useRouter();
  const linePath = router.query.line as LinePath | undefined;
  const lineKey = linePath ? linePathToKey[linePath] : undefined;
  const lineName = lineKey ? LINE_OBJECTS[lineKey]?.name : undefined;

  const pageName = getPageName(router.pathname);

  const trip = getTripSummary(router.query, lineShortFor(linePath));
  const title = [lineName, trip ?? pageName, 'Data Dashboard'].filter(Boolean).join(' | ');
  const description = trip
    ? `${trip}${dateSummary(router.query)} on the ${lineName ?? 'MBTA'}, from the TransitMatters Data Dashboard.`
    : lineName
      ? `${lineName} ${pageName?.toLowerCase() ?? 'performance'} data on the TransitMatters Data Dashboard.`
      : DEFAULT_DESCRIPTION;

  const canonicalUrl = `${BASE_URL}${router.asPath === '/' ? '/' : router.asPath}`;

  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${BASE_URL}/twitter-card.jpg`} />
      <meta property="og:site_name" content="TransitMatters Data Dashboard" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@transitmatters" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${BASE_URL}/twitter-card.jpg`} />
      <meta name="description" content={description} />
    </Head>
  );
};
