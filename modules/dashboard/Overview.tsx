import React from 'react';
import { useRouter } from 'next/router';
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
import { OverviewRedesign } from './redesign/OverviewRedesign';

export function Overview() {
  const { tab, line } = useDelimitatedRoute();
  const router = useRouter();

  useRewriteV3Route();

  const lineShort = line && line !== 'line-bus' ? LINE_OBJECTS[line].short : null;

  // Design-doc option 2b, side by side with the live page — see modules/dashboard/redesign/.
  if (router.query.redesign === '1') {
    return (
      <PageWrapper pageTitle={'Overview'}>
        <OverviewRedesign />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper pageTitle={'Overview'}>
      <div className="grid w-full grid-cols-1 gap-4 md:gap-8 xl:grid-cols-2">
        {tab === 'Subway' && <SpeedWidget />}
        {tab === 'Subway' && <ServiceWidget />}
        {line !== 'line-mattapan' && <RidershipWidget />}
        {tab === 'Subway' && <SlowZonesWidget />}
        <div className="grid w-full grid-cols-1 gap-4 md:gap-8 xl:col-span-2 xl:grid-cols-2">
          {tab === 'Subway' && lineShort && <AlertsWidget lineShort={lineShort} />}
        </div>
      </div>
    </PageWrapper>
  );
}

Overview.Layout = Layout.Dashboard;
