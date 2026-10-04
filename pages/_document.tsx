import { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

export default function Document() {
  return (
    <Html lang="en" className="h-full font-sans">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/png" href={`/favicon.png`} />
        <link rel="manifest" href={`/manifest.json`} />
        {/* The header logo is the LCP element but only renders client-side, so fetch it up front. */}
        <link
          rel="preload"
          href="/TMLogo.svg"
          as="image"
          type="image/svg+xml"
          fetchPriority="high"
        />
        {/* Set the theme class before first paint to avoid a flash (reads the persisted store). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=JSON.parse(localStorage.getItem('tm-theme')||'{}').state;if(t&&t.theme==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </Head>
      <body className="bg-tm-grey">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
