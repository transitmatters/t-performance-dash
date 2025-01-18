import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { SlowZonesWidget } from '../slowzones/SlowZonesWidget';
import { SpeedWidget } from '../speed/SpeedWidget';
import { ServiceWidget } from '../service/ServiceWidget';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { RidershipWidget } from '../ridership/RidershipWidget';
import { useRewriteV3Route } from '../../common/utils/middleware';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { AlertsWidget } from '../alerts/AlertsWidget';

export function Overview() {
  const { tab, line } = useDelimitatedRoute();

  useRewriteV3Route();

  const lineShort = line && line !== 'line-bus' ? LINE_OBJECTS[line].short : null;

  return (
    <PageWrapper pageTitle={'Overview'}>
      <div className="grid w-full grid-cols-1 gap-4 md:gap-8 xl:grid-cols-2">
        {tab === 'Subway' && <SpeedWidget />}
        {tab === 'Subway' && <ServiceWidget />}
        <RidershipWidget />
        {tab === 'Subway' && <SlowZonesWidget />}
        <div className="grid w-full grid-cols-1 gap-4 md:gap-8 xl:col-span-2 xl:grid-cols-2">
          {tab === 'Subway' && lineShort && <AlertsWidget lineShort={lineShort} />}
        </div>
      </div>
    </PageWrapper>
  );
}

Overview.Layout = Layout.Dashboard;
