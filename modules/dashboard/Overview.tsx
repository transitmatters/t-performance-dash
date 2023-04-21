import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import SlowZonesWidget from '../slowzones/SlowZonesWidget';
import { SpeedWidget } from '../speed/SpeedWidget';
import { RidershipWidget } from '../ridership/RidershipWidget';
import { ServiceWidget } from '../service/ServiceWidget';

export default function Overview() {
  const { tab, line } = useDelimitatedRoute();
  return (
    <div className="flex flex-col pt-2">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {tab === 'Subway' && line !== 'GL' && <SlowZonesWidget />}
        {tab === 'Subway' && line !== 'GL' && <SpeedWidget />}
        {tab === 'Subway' && line !== 'GL' && <ServiceWidget />}
        <RidershipWidget />
      </div>
    </div>
  );
}
