/* eslint-disable import/no-default-export */
import '../styles/globals.css';
import React from 'react';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
