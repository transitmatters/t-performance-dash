import type { FC, ReactNode } from 'react';

interface PageWrapperProps {
  pageTitle?: string;
  children: ReactNode;
}

export const PageWrapper: FC<PageWrapperProps> = ({ pageTitle, children }) => {
  return (
    <>
      <title>{`${pageTitle ? `${pageTitle} | ` : ''}Data Dashboard`}</title>
      {children}
    </>
  );
};
