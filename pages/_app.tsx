'use client';
import React, { useEffect, useState } from 'react';
import { DashboardLayoutMobile } from '../components/DashboardLayoutMobile';
import { DashboardLayoutDesktop } from '../components/DashboardLayoutDesktop';
import { Layout } from '../components/Layout';
import { useBreakpoint } from '../components/utils/ScreenSize';
import '../styles/dashboard.css';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const isMobile = !useBreakpoint('sm');
  const [loaded, setLoaded] = useState(false);

  // Don't load on the server. This prevents hydration errors between mobile/desktop layouts.
  useEffect(() => {
    setLoaded(true);
  }, []);
  if (!loaded) return null;

  return (
    <Layout>
      {isMobile ? (
        <DashboardLayoutMobile>
          <Component {...pageProps} />
        </DashboardLayoutMobile>
      ) : (
        <DashboardLayoutDesktop>
          <Component {...pageProps} />
        </DashboardLayoutDesktop>
      )}
    </Layout>
  );
}
