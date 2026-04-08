import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { Line, LinePath } from '../types/lines';
import { LINE_OBJECTS } from '../constants/lines';

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

export const DynamicMetaTags: React.FC = () => {
  const router = useRouter();
  const linePath = router.query.line as LinePath | undefined;
  const lineKey = linePath ? linePathToKey[linePath] : undefined;
  const lineName = lineKey ? LINE_OBJECTS[lineKey]?.name : undefined;

  const pageName = getPageName(router.pathname);

  const title = [lineName, pageName, 'Data Dashboard'].filter(Boolean).join(' | ');
  const description = lineName
    ? `${lineName} ${pageName?.toLowerCase() ?? 'performance'} data on the TransitMatters Data Dashboard.`
    : DEFAULT_DESCRIPTION;

  const path = linePath ? `/${linePath}/` : router.pathname === '/' ? '/' : `${router.asPath}`;
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Head>
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
