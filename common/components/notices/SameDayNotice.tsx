import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDelimitatedRoute } from '../../utils/router';
import { TODAY_STRING } from '../../constants/dates';
import { Notice } from './Notice';

export const SameDayNotice: React.FC = () => {
  const { t } = useTranslation();
  const {
    query: { date, endDate },
  } = useDelimitatedRoute();
  const isToday = date === TODAY_STRING || endDate === TODAY_STRING;

  if (!isToday) {
    return null;
  }

  return <Notice variant="warning">{t('notices.sameDay')}</Notice>;
};
