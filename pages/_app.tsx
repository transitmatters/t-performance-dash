/* eslint-disable react/prop-types */
'use client';

import React, { useEffect, useState } from 'react';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { GCScript } from 'next-goatcounter';
import '../styles/dashboard.css';
import '../styles/globals.css';
import { Layouts } from '../common/layouts/Layouts';
import { Layout } from '../common/layouts/PrimaryLayout';

import { PRODUCTION } from '../common/utils/constants';
import { NavLayout } from '../common/layouts/NavLayout';

config.autoAddCss = false;

export default function App({ Component, pageProps }) {
  const isProd = typeof window !== 'undefined' && window.location.hostname === PRODUCTION;

  const [loaded, setLoaded] = useState(false);
  const SecondaryLayout = Layouts[Component.Layout] ?? ((page) => page);

  // Don't load on the server. This prevents hydration errors between mobile/desktop layouts.
  useEffect(() => {
    setLoaded(true);
  }, []);
  if (!loaded) return null;

  return (
    <Layout>
      <NavLayout>
        <SecondaryLayout>
          {isProd && <GCScript siteUrl={'https://transitmatters-dd.goatcounter.com/count'} />}
          <Component {...pageProps} />
        </SecondaryLayout>
      </NavLayout>
    </Layout>
  );
}
