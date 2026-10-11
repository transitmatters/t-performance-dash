import React from 'react';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { OverviewRedesign } from './redesign/OverviewRedesign';

export function Overview() {
  return (
    <PageWrapper pageTitle={'Overview'}>
      <OverviewRedesign />
    </PageWrapper>
  );
}
