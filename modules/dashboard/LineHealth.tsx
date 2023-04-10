import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { DwellsWidget } from '../dwells/DwellsWidget';
import { HeadwaysWidget } from '../headways/HeadwaysWidget';
import { RidershipWidget } from '../ridership/RidershipWidget';
import SlowZonesWidget from '../slowzones/SlowZonesWidget';
import { SpeedWidget } from '../speed/SpeedWidget';
import { TravelTimesWidget } from '../traveltimes/TravelTimesWidget';
import { OverviewDateSelection } from '../../common/components/inputs/DateSelection/OverviewDateSelection';

export const LineHealth = () => {
  const { tab, line } = useDelimitatedRoute();

  return (
    <div>
      <div className="flex w-full flex-col justify-between sm:flex-row">
        <h1 className="text-xl">Line Health</h1>
        <OverviewDateSelection />
      </div>
      <hr className="my-2 h-[2px] border-0 border-b border-white bg-gray-400" />
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {tab === 'Subway' && line !== 'GL' && <SpeedWidget />}
        {tab === 'Subway' && line !== 'GL' && <SlowZonesWidget />}
        <TravelTimesWidget />
        <HeadwaysWidget />
        {tab === 'Subway' && <DwellsWidget />}
        <RidershipWidget />
      </div>
    </div>
  );
};
