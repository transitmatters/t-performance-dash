import React from 'react';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { useRewriteV3Route } from '../../common/utils/middleware';
import { OverviewRedesign } from './redesign/OverviewRedesign';

export function Overview() {
  useRewriteV3Route();

  return (
    <PageWrapper pageTitle={'Overview'}>
      <OverviewRedesign />
    </PageWrapper>
  );
}

Overview.Layout = Layout.Dashboard;
