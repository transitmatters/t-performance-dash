import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { RidershipWidget } from '../ridership/RidershipWidget';
import SlowZonesWidget from '../slowzones/SlowZonesWidget';
import { SpeedWidget } from '../speed/SpeedWidget';

export const LineHealth = () => {
  const { tab, line } = useDelimitatedRoute();

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {tab === 'Subway' && line !== 'GL' && <SlowZonesWidget />}
        {tab === 'Subway' && line !== 'GL' && <SpeedWidget />}
        <RidershipWidget />
      </div>
    </div>
  );
};
