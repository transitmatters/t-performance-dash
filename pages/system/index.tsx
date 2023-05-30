import React from 'react';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { LayoutType } from '../../common/layouts/layoutTypes';

export default function System() {
  return <PageWrapper>test</PageWrapper>;
}

System.Layout = LayoutType.Dashboard;
