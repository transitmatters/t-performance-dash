import React from 'react';
import { useTranslation } from 'react-i18next';

interface PageWrapperProps {
  pageTitle?: string;
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ pageTitle, children }) => {
  const { t } = useTranslation();
  return (
    <>
      <title>{pageTitle ? t('app.pageTitle', { page: pageTitle }) : t('app.name')}</title>
      {children}
    </>
  );
};
