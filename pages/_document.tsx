import { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

export default function Document() {
  return (
    <Html lang="en" className="font-sans h-full bg-gray-100">
      <Head />
      <body className="bg-design-background">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
