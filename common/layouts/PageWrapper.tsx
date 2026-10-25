import type { ReactNode } from 'react';

interface PageWrapperProps {
  pageTitle?: string;
  children: ReactNode;
}

export const PageWrapper = ({ pageTitle, children }: PageWrapperProps) => {
  return (
    <>
      <title>{`${pageTitle ? `${pageTitle} | ` : ''}Data Dashboard`}</title>
      {children}
    </>
  );
};
