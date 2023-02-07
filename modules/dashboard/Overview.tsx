import React from 'react';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { DwellsWidget } from '../../modules/dwells/DwellsWidget';
import { HeadwaysWidget } from '../../modules/headways/HeadwaysWidget';
import SlowZonesWidget from '../../modules/slowzones/SlowZonesWidget';
import { TravelTimesWidget } from '../../modules/traveltimes/TravelTimesWidget';

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
        <BasicDataWidgetItem title="Median" value="5:37" analysis="-0:12 from last Weds." />
        <BasicDataWidgetItem title="Median" value="5:37" analysis="-0:12 from last Weds." />
      </BasicDataWidgetPair>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem title="Today" value="5:37" analysis="-0:12 from last Weds." />
        <BasicDataWidgetItem title="Today" value="5:37" analysis="-0:12 from last Weds." />
      </BasicDataWidgetPair>
      <TravelTimesWidget />
      <SlowZonesWidget />
      <HeadwaysWidget />
      <DwellsWidget />
    </>
  );
}
