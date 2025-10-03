import React from 'react';

import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { useServiceAndRidershipDashboard } from '../../common/api/hooks/serviceAndRidership';

import { SystemRidershipDetails } from '../ridership/SystemRidershipDetails';
import { LineGrid } from './LineGrid';
import { ServiceAndRidershipProvider } from './ServiceAndRidershipProvider';

export function ServiceAndRidershipDash() {
  const { data } = useServiceAndRidershipDashboard();

  return (
    <PageWrapper pageTitle={'Service & Ridership'}>
      <div className="flex w-full flex-col gap-4">
        <SystemRidershipDetails />
        <ServiceAndRidershipProvider>{data && <LineGrid {...data} />}</ServiceAndRidershipProvider>
      </div>
    </PageWrapper>
  );
}

ServiceAndRidershipDash.Layout = Layout.Dashboard;
