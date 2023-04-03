import React, { useState } from 'react';
import type { TimeRange } from '../../common/types/inputs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { DwellsWidget } from '../dwells/DwellsWidget';
import { HeadwaysWidget } from '../headways/HeadwaysWidget';
import { RidershipWidget } from '../ridership/RidershipWidget';
import SlowZonesWidget from '../slowzones/SlowZonesWidget';
import { TravelTimesWidget } from '../traveltimes/TravelTimesWidget';

export const LineHealth = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const { tab } = useDelimitatedRoute();

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {tab === 'Subway' && <SlowZonesWidget />}
        <TravelTimesWidget />
        <HeadwaysWidget />
        {tab === 'Subway' && <DwellsWidget />}
        <RidershipWidget />
      </div>
    </div>
  );
};
