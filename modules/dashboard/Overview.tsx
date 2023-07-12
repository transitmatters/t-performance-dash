import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { SlowZonesWidget } from '../slowzones/SlowZonesWidget';
import { SpeedWidget } from '../speed/SpeedWidget';
import { ServiceWidget } from '../service/ServiceWidget';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { RidershipWidget } from '../ridership/RidershipWidget';
import { HEAVY_RAIL_LINES } from '../../common/types/lines';
import { useRewriteV3Route } from '../../common/utils/middleware';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';

export function Overview() {
  const { tab, line } = useDelimitatedRoute();

  useRewriteV3Route();

  const isHeavyRailLine = line ? HEAVY_RAIL_LINES.includes(line) : false;
  return (
    <PageWrapper pageTitle={'Overview'}>
      <ChartPageDiv>
        {tab === 'Subway' && <SpeedWidget />}
        {tab === 'Subway' && <ServiceWidget />}
        <RidershipWidget />
        {tab === 'Subway' && isHeavyRailLine && <SlowZonesWidget />}
      </ChartPageDiv>
    </PageWrapper>
  );
}

Overview.Layout = Layout.Dashboard;
