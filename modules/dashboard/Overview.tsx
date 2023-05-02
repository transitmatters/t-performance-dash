import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { SlowZonesWidget } from '../slowzones/SlowZonesWidget';
import { SpeedWidget } from '../speed/SpeedWidget';
import { RidershipWidget } from '../ridership/RidershipWidget';
import { ServiceWidget } from '../service/ServiceWidget';

export const Overview: React.FC = () => {
  const { tab, line } = useDelimitatedRoute();
  return (
    <div className="flex flex-col pt-2">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
<<<<<<< HEAD
        {tab === 'Subway' && line !== 'GL' && <SlowZonesWidget />}
        {tab === 'Subway' && line !== 'GL' && <SpeedWidget />}
        {tab === 'Subway' && line !== 'GL' && <ServiceWidget />}
=======
        {tab === 'Subway' && line !== 'line-green' && <SlowZonesWidget />}
        {tab === 'Subway' && line !== 'line-green' && <SpeedWidget />}
>>>>>>> 29dcb89 (Swapping from RL keys to line-red (#459))
        <RidershipWidget />
      </div>
    </div>
  );
};
