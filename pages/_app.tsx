'use client';
import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Layout } from '../components/Layout';
import '../styles/dashboard.css';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(
    <Layout>
      <DashboardLayout>
        <Component {...pageProps} />
      </DashboardLayout>
    </Layout>
  );
}
