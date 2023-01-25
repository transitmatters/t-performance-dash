'use client';
import React from 'react';
import { classNames } from '../components/utils/tailwind';
import { WidgetPage } from '../components/widgets/Widget';
import { BasicDataWidgetItem } from '../components/widgets/BasicDataWidgetItem';
import { BasicDataWidgetPair } from '../components/widgets/BasicDataWidgetPair';
import { DataPageHeader } from '../components/widgets/DataPageHeader';
import { BottomNavBar } from '../components/general/BottomNavBar';
import SlowZones from '../components/widgets/SlowZonesWidget';
import { useSelectedStore } from '../stores/useSelected';
import { TravelTimesWidget } from '../components/widgets/TravelTimesWidget';
import { HeadwaysWidget } from '../components/widgets/HeadwaysWidget';

export default function Home() {
  const line = useSelectedStore((state) => state.line);
  return (
    <div className={classNames('flex w-full flex-col items-center')}>
      <DataPageHeader title="Headways" line={line.short} dateString="Today (TBD)" />
      <WidgetPage>
        <BasicDataWidgetPair>
          <BasicDataWidgetItem title="Median" value="5:37" analysis="-0:12 from last Weds." />
          <BasicDataWidgetItem title="Median" value="5:37" analysis="-0:12 from last Weds." />
        </BasicDataWidgetPair>{' '}
        <BasicDataWidgetPair>
          <BasicDataWidgetItem title="Median" value="5:37" analysis="-0:12 from last Weds." />
          <BasicDataWidgetItem
            title="New Trains"
            value="4"
            analysis="-1 from last Weds."
            units="trains"
          />
        </BasicDataWidgetPair>
        <BasicDataWidgetPair>
          <BasicDataWidgetItem title="Today" value="5:37" analysis="-0:12 from last Weds." />
          <BasicDataWidgetItem title="Today" value="5:37" analysis="-0:12 from last Weds." />
        </BasicDataWidgetPair>
        <TravelTimesWidget />
        <HeadwaysWidget />
        <SlowZones />
      </WidgetPage>
      <BottomNavBar />
    </div>
  );
}
