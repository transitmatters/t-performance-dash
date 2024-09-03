import React from 'react';

import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { useServiceAndRidershipDashboard } from '../../common/api/hooks/serviceAndRidership';

import { LineGrid } from './LineGrid';
import { ServiceAndRidershipProvider } from './ServiceAndRidershipProvider';

export function ServiceAndRidershipDash() {
  const { data } = useServiceAndRidershipDashboard();

  return (
    <PageWrapper pageTitle={'Service & Ridership'}>
      <ServiceAndRidershipProvider>{data && <LineGrid {...data} />}</ServiceAndRidershipProvider>
    </PageWrapper>
  );
}

ServiceAndRidershipDash.Layout = Layout.Dashboard;
