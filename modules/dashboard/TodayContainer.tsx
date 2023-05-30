import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { LayoutType } from '../../common/layouts/layoutTypes';
import { Today } from './Today';

export function TodayContainer() {
  const { tab, lineShort } = useDelimitatedRoute();

  if (tab !== 'Subway' || lineShort === 'Bus') {
    return null;
  }
  return <Today lineShort={lineShort} />;
}
TodayContainer.Layout = LayoutType.Dashboard;
