import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDelimitatedRoute } from '../../utils/router';
import { Notice } from './Notice';

export const CrBetaAccuracyNotice: React.FC = () => {
  const { t } = useTranslation();
  const { line, linePath } = useDelimitatedRoute();

  if (line !== 'line-commuter-rail' && linePath !== 'commuter-rail') {
    return null;
  }

  return <Notice variant="warning">{t('notices.crBetaAccuracy')}</Notice>;
};
