import React from 'react';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '../../common/layouts/PageWrapper';
import { useServiceAndRidershipDashboard } from '../../common/api/hooks/serviceAndRidership';

import { LineGrid } from './LineGrid';
import { ServiceAndRidershipProvider } from './ServiceAndRidershipProvider';
import { SummaryCard } from './SummaryCard';

export function ServiceAndRidershipDash() {
  const { t } = useTranslation();
  const { data } = useServiceAndRidershipDashboard();

  return (
    <PageWrapper pageTitle={t('pages.systemServiceAndRidership.name')}>
      <div className="flex w-full flex-col gap-4">
        <ServiceAndRidershipProvider>
          {data && <SummaryCard {...data} />}
          {data && <LineGrid {...data} />}
        </ServiceAndRidershipProvider>
      </div>
    </PageWrapper>
  );
}
