import React from 'react';
import { useTranslation } from 'react-i18next';

const CIP_EXPIRY = new Date('2026-05-02T00:00:00');

export const CIPBanner: React.FC = () => {
  const { t } = useTranslation();
  if (new Date() >= CIP_EXPIRY) return null;

  return (
    <a
      href="https://secure.everyaction.com/DKcTW8SPr06sCMwjIo44UA2"
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-10 block bg-tm-red px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-mbta-darkRed md:py-4 md:text-base"
    >
      {t('banners.cip')}
    </a>
  );
};
