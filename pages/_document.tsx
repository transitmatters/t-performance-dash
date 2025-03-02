import { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

export default function Document() {
  return (
    <Html lang="en" className="font-sans h-full">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#000000" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@transitmatters" />
        <meta name="twitter:title" content="TransitMatters Data Dashboard" />
        <meta
          name="twitter:description"
          content="Explore MBTA subway, commuter rail and bus performance data with the TransitMatters Data Dashboard."
        />
        <meta name="twitter:image" content={`/twitter-card.jpg`} />
        <link rel="icon" type="image/png" href={`/favicon.png`} />
        <link rel="manifest" href={`/manifest.json`} />
      </Head>
      <body className="bg-tm-grey">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
