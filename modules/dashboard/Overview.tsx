import React from 'react';
import { DwellsWidget } from '../../modules/dwells/DwellsWidget';
import { HeadwaysWidget } from '../../modules/headways/HeadwaysWidget';
import SlowZonesWidget from '../../modules/slowzones/SlowZonesWidget';
import { TravelTimesWidget } from '../../modules/traveltimes/TravelTimesWidget';
import { TodaysCommute } from '../commute/TodaysCommute';
import { RidershipWidget } from '../ridership/RidershipWidget';

export default function Overview() {
  return (
    <div>
      <h1>Today's Commute</h1>
      <TodaysCommute />
      <h1>Line Health</h1>
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <TravelTimesWidget />
        <SlowZonesWidget />
        <HeadwaysWidget />
        <DwellsWidget />
        <RidershipWidget />
      </div>
    </div>
  );
}
