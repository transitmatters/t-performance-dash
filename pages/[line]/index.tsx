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
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Median"
          value="5:37"
          analysis="from last Weds."
          change="-0:12 "
        />
        <BasicDataWidgetItem
          title="Median"
          value="5:37"
          analysis="from last Weds."
          change="-0:12"
        />
      </BasicDataWidgetPair>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Today"
          value="5:37"
          analysis="from last Weds."
          change="-0:12 "
        />
        <BasicDataWidgetItem title="Today" value="5:37" analysis="from last Weds." change="-0:12" />
      </BasicDataWidgetPair>
      <TravelTimesWidget />
      <SlowZonesWidget />
      <HeadwaysWidget />
      <DwellsWidget />
    </>
  );
}
