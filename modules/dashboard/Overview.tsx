import React from 'react';
import { DwellsWidget } from '../../modules/dwells/DwellsWidget';
import { HeadwaysWidget } from '../../modules/headways/HeadwaysWidget';
import SlowZonesWidget from '../../modules/slowzones/SlowZonesWidget';
import { TravelTimesWidget } from '../../modules/traveltimes/TravelTimesWidget';
import { Alerts } from '../commute/alerts/Alerts';
import { Speed } from '../commute/speed/Speed';
import { RidershipWidget } from '../ridership/RidershipWidget';

export default function Overview() {
  return (
    <div className="flex flex-col gap-y-8 pt-2">
      <div>
        <h1 className="text-xl">Today's Commute</h1>
        <hr className="my-2 h-[2px] border-0 border-b border-white bg-gray-400" />
        <div className="flex flex-col gap-y-2">
          <Alerts />
          <Speed />
        </div>
      </div>
      <div>
        <h1 className="text-xl">Line Health</h1>
        <hr className="my-2 h-[2px] border-0 border-b border-white bg-gray-400" />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <TravelTimesWidget />
          <SlowZonesWidget />
          <HeadwaysWidget />
          <DwellsWidget />
          <RidershipWidget />
        </div>
      </div>
    </div>
  );
}
