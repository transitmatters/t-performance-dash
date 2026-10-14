import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Station } from '../../types/stations';
import { Notice } from './Notice';

interface TerminusNoticeProps {
  toStation?: Station;
  fromStation?: Station;
}

export const TerminusNotice: React.FC<TerminusNoticeProps> = ({ toStation, fromStation }) => {
  const { t } = useTranslation();
  const isTerminus = toStation?.terminus || fromStation?.terminus;

  if (!isTerminus) {
    return null;
  }

  return <Notice variant="warning">{t('notices.terminus')}</Notice>;
};
