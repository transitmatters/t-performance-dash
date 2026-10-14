import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDelimitatedRoute } from '../../utils/router';

/**
 * Bus coverage note. Renders as plain prose for the "About this data"
 * accordion (see TripDataNotes).
 */
export const BusDataNotice: React.FC = () => {
  const { t } = useTranslation();
  const { line, linePath } = useDelimitatedRoute();

  if (line !== 'line-bus' && linePath !== 'bus') {
    return null;
  }

  return <p>{t('notices.busData')}</p>;
};
