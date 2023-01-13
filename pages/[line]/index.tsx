import React from 'react';
import { BasicDataWidgetItem } from '../../components/widgets/BasicDataWidgetItem';
import { BasicDataWidgetPair } from '../../components/widgets/BasicDataWidgetPair';
import SlowZonesWidget from '../../components/widgets/SlowZonesWidget';
import { TravelTimesWidget } from '../../components/widgets/TravelTimesWidget';

// This might be useless.
export async function generateStaticParams() {
  return [{ line: 'RL' }, { line: 'OL' }, { line: 'GL' }, { line: 'BL' }, { line: 'BUS' }];
}

export default function General() {
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
    </>
  );
}
