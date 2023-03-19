import React, { useState } from 'react';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { DwellsWidget } from '../dwells/DwellsWidget';
import { HeadwaysWidget } from '../headways/HeadwaysWidget';
import { RidershipWidget } from '../ridership/RidershipWidget';
import SlowZonesWidget from '../slowzones/SlowZonesWidget';
import { DelaysWidget } from '../speed/DelaysWidget';
import { TravelTimesWidget } from '../traveltimes/TravelTimesWidget';

export type TimeRange = 'week' | 'month' | 'year' | 'all';

enum TimeRangeNames {
  'week' = 'Past Week',
  'month' = 'Past Month',
  'year' = 'Past Year',
  'all' = 'All Time',
}

export const LineHealth = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  return (
    <div>
      <div className="flex w-full flex-col justify-between sm:flex-row">
        <h1 className="text-xl">Line Health</h1>
        <ButtonGroup pressFunction={setTimeRange} options={Object.entries(TimeRangeNames)} />
      </div>
      <hr className="my-2 h-[2px] border-0 border-b border-white bg-gray-400" />
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <DelaysWidget timeRange={timeRange} />
        <SlowZonesWidget />
        <TravelTimesWidget />
        <HeadwaysWidget />
        <DwellsWidget />
        <RidershipWidget />
      </div>
    </div>
  );
};
