/* eslint-disable import/no-default-export */
import '../styles/globals.css';
import React from 'react';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
