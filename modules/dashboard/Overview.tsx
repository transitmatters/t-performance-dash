import React from 'react';
import { DwellsWidget } from '../../modules/dwells/DwellsWidget';
import { HeadwaysWidget } from '../../modules/headways/HeadwaysWidget';
import SlowZonesWidget from '../../modules/slowzones/SlowZonesWidget';
import { TravelTimesWidget } from '../../modules/traveltimes/TravelTimesWidget';
import { RidershipWidget } from '../ridership/RidershipWidget';

// This might be useless.
export async function generateStaticParams() {
  return [
    { line: 'red' },
    { line: 'orange' },
    { line: 'green' },
    { line: 'blue' },
    { line: 'bus' },
  ];
}

export default function Overview() {
  return (
    <>
      <TravelTimesWidget />
      <SlowZonesWidget />
      <HeadwaysWidget />
      <DwellsWidget />
      <RidershipWidget />
    </>
  );
}
