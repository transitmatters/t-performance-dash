import Head from 'next/head';
import React from 'react';
import { LayoutType } from '../common/layouts/layoutTypes';

export default function Page() {
  return (
    <div>
      <Head>
        <title>Data Dashboard - 404</title>
      </Head>
      <p>Unable to find page</p>
    </div>
  );
}

Page.Layout = LayoutType.Landing;
