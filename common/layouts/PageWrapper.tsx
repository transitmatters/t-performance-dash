import Head from 'next/head';
import React from 'react';
import { useDelimitatedRoute } from '../utils/router';
import { LINE_OBJECTS } from '../constants/lines';

const BASE_URL = 'https://dashboard.transitmatters.org';
const DEFAULT_DESCRIPTION =
  'Explore MBTA subway, commuter rail and bus performance data with the TransitMatters Data Dashboard.';

interface PageWrapperProps {
  pageTitle?: string;
  children: React.ReactNode;
}

const getLineDisplayName = (lineKey: string): string | undefined => {
  const lineObj = LINE_OBJECTS[lineKey as keyof typeof LINE_OBJECTS];
  return lineObj?.name;
};

export const PageWrapper: React.FC<PageWrapperProps> = ({ pageTitle, children }) => {
  const { line, linePath } = useDelimitatedRoute();

  const lineName = line ? getLineDisplayName(line) : undefined;

  const title = [lineName, pageTitle, 'Data Dashboard'].filter(Boolean).join(' | ');

  const description = lineName
    ? `${lineName} ${pageTitle?.toLowerCase() ?? 'performance'} data on the TransitMatters Data Dashboard.`
    : DEFAULT_DESCRIPTION;

  const path = linePath ? `/${linePath}/` : '/';
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <>
      <Head>
        <title>{title}</title>
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
      {children}
    </>
  );
};
