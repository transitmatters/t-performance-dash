import React from 'react';

interface PageWrapperProps {
  pageTitle?: string;
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ pageTitle, children }) => {
  return (
    <>
      <title>{`${pageTitle ? `${pageTitle} | ` : ''}Data Dashboard`}</title>
      {children}
    </>
  );
};
