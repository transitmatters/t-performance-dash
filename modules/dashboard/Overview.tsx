import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { OverviewRedesign } from './redesign/OverviewRedesign';

export function Overview() {
  const { t } = useTranslation('dashboard');
  return (
    <PageWrapper pageTitle={t('overview.pageTitle')}>
      <OverviewRedesign />
    </PageWrapper>
  );
}
