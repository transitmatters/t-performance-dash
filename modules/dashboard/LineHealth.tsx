import React, { useState } from 'react';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import type { TimeRange } from '../../common/types/inputs';
import { TimeRangeNames } from '../../common/types/inputs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { DwellsWidget } from '../dwells/DwellsWidget';
import { HeadwaysWidget } from '../headways/HeadwaysWidget';
import { RidershipWidget } from '../ridership/RidershipWidget';
import { SlowZonesWidget } from '../slowzones/SlowZonesWidget';
import { SpeedWidget } from '../speed/SpeedWidget';
import { TravelTimesWidget } from '../traveltimes/TravelTimesWidget';

export const LineHealth = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const { tab } = useDelimitatedRoute();

  return (
    <div>
      <div className="flex w-full flex-col justify-between sm:flex-row">
        <h1 className="text-xl">Line Health</h1>
        <ButtonGroup pressFunction={setTimeRange} options={Object.entries(TimeRangeNames)} />
      </div>
      <hr className="my-2 h-[2px] border-0 border-b border-white bg-gray-400" />
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <SpeedWidget timeRange={timeRange} />
        {tab === 'Subway' && <SlowZonesWidget timeRange={timeRange} />}
        <TravelTimesWidget />
        <HeadwaysWidget />
        {tab === 'Subway' && <DwellsWidget />}
        <RidershipWidget />
      </div>
    </div>
  );
};
