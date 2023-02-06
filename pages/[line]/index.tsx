import React from 'react';
import { BasicDataWidgetItem } from '../../components/widgets/BasicDataWidgetItem';
import { BasicDataWidgetPair } from '../../components/widgets/BasicDataWidgetPair';
import { DwellsWidget } from '../../components/widgets/DwellsWidget';
import { HeadwaysWidget } from '../../components/widgets/HeadwaysWidget';
import SlowZonesWidget from '../../components/widgets/SlowZonesWidget';
import { TravelTimesWidget } from '../../components/widgets/TravelTimesWidget';

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
    </>
  );
}
