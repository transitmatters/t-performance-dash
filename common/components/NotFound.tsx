import React from 'react';
import { useTranslation } from 'react-i18next';
import { LandingLayout } from '../layouts/LandingLayout';
import { Link } from './general/Link';

export const NotFound: React.FC = () => {
  const { t } = useTranslation();
  return (
    <LandingLayout>
      <div className="h-screen w-full">
        <title>{t('notFound.documentTitle')}</title>
        <div className="flex h-full w-full flex-col items-center gap-4 bg-tm-lightGrey pt-20">
          <h1 className="text-xl text-white lg:text-5xl">{t('notFound.heading')}</h1>
          <Link href="/">
            <p className="text-blue-500">{t('notFound.returnHome')}</p>
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
};
