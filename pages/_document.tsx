import { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

export default function Document() {
  return (
    <Html lang="en" className="font-sans h-full">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#000000" />
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
