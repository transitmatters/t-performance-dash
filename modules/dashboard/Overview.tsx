import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { SlowZonesWidget } from '../slowzones/SlowZonesWidget';
import { SpeedWidget } from '../speed/SpeedWidget';
import { RidershipWidget } from '../ridership/RidershipWidget';
import { PageWrapper } from '../../common/layouts/PageWrapper';

export const Overview: React.FC = () => {
  const { tab, line } = useDelimitatedRoute();
  return (
    <PageWrapper pageTitle={'Overview'}>
      <div className="flex flex-col pt-2">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {tab === 'Subway' && line !== 'line-green' && <SlowZonesWidget />}
          {tab === 'Subway' && line !== 'line-green' && <SpeedWidget />}
          <RidershipWidget />
        </div>
      </div>
    </PageWrapper>
  );
};
