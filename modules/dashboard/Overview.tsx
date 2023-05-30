import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { SlowZonesWidget } from '../slowzones/SlowZonesWidget';
import { SpeedWidget } from '../speed/SpeedWidget';
import { RidershipWidget } from '../ridership/RidershipWidget';
import { ServiceWidget } from '../service/ServiceWidget';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { LayoutType } from '../../common/layouts/layoutTypes';

export function Overview() {
  const { tab, line } = useDelimitatedRoute();
  return (
    <PageWrapper pageTitle={'Overview'}>
      <div className="flex flex-col pt-2">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {tab === 'Subway' && line !== 'line-green' && <SlowZonesWidget />}
          {tab === 'Subway' && line !== 'line-green' && <SpeedWidget />}
          {tab === 'Subway' && line !== 'line-green' && <ServiceWidget />}
          <RidershipWidget />
        </div>
      </div>
    </PageWrapper>
  );
}

Overview.Layout = LayoutType.Dashboard;
