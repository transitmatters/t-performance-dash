/* eslint-disable react/prop-types */
'use client';

import React, { useEffect, useState } from 'react';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Layout } from '../common/layouts/PrimaryLayout';
import '../styles/dashboard.css';
import '../styles/globals.css';
import { Layouts } from '../common/layouts/Layouts';

config.autoAddCss = false;

export default function App({ Component, pageProps }) {
  const [loaded, setLoaded] = useState(false);
  const SecondaryLayout = Layouts[Component.Layout] ?? ((page) => page);

  // Don't load on the server. This prevents hydration errors between mobile/desktop layouts.
  useEffect(() => {
    setLoaded(true);
  }, []);
  if (!loaded) return null;

  return (
    <Layout>
      <SecondaryLayout>
        <Component {...pageProps} />
      </SecondaryLayout>
    </Layout>
  );
}
