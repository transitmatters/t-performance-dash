import Head from 'next/head';
import React from 'react';

interface PageWrapperProps {
  pageTitle: string;
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ pageTitle, children }) => {
  return (
    <>
      <Head>
        <title>Data Dashboard - {pageTitle}</title>
      </Head>
      {children}
    </>
  );
};
