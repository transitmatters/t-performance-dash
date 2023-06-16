import React from 'react';
import { useRouter } from 'next/router';
import { useDelimitatedRoute } from '../../common/utils/router';
import { SlowZonesWidget } from '../slowzones/SlowZonesWidget';
import { SpeedWidget } from '../speed/SpeedWidget';
import { ServiceWidget } from '../service/ServiceWidget';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { RidershipWidget } from '../ridership/RidershipWidget';
import { HEAVY_RAIL_LINES } from '../../common/types/lines';

export function Overview() {
  const { tab, line } = useDelimitatedRoute();
  const router = useRouter();

  // Semi-hacky way of making sure `/bus` works. Remove this when content is added to `/bus`.
  if (line === 'line-bus') router.push('/bus/trips/single?busRoute=1');

  const isHeavyRailLine = line ? HEAVY_RAIL_LINES.includes(line) : false;
  return (
    <PageWrapper pageTitle={'Overview'}>
      <div className="flex flex-col pt-2">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {tab === 'Subway' && isHeavyRailLine && <SlowZonesWidget />}
          {tab === 'Subway' && isHeavyRailLine && <SpeedWidget />}
          {tab === 'Subway' && isHeavyRailLine && <ServiceWidget />}
          <RidershipWidget />
        </div>
      </div>
    </PageWrapper>
  );
}

Overview.Layout = Layout.Dashboard;
