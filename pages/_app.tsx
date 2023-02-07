'use client';
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../common/layouts/DashboardLayout';
import { Layout } from '../common/layouts/Layout';
import '../styles/dashboard.css';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const [loaded, setLoaded] = useState(false);

  // Don't load on the server. This prevents hydration errors between mobile/desktop layouts.
  useEffect(() => {
    setLoaded(true);
  }, []);
  if (!loaded) return null;

  return (
    <Layout>
      <DashboardLayout>
        <Component {...pageProps} />
      </DashboardLayout>
    </Layout>
  );
}
