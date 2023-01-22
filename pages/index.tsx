'use client';
import React from 'react';
import { classNames } from '../components/utils/tailwind';
import { WidgetPage } from '../components/widgets/Widget';
import { BasicDataWidgetItem } from '../components/widgets/BasicDataWidgetItem';
import { BasicDataWidgetPair } from '../components/widgets/BasicDataWidgetPair';
import { DataPageHeader } from '../components/widgets/DataPageHeader';
import { HomescreenWidgetTitle } from '../components/widgets/HomescreenWidgetTitle';
import { BottomNavBar } from '../components/general/BottomNavBar';
import SlowZones from './slowzones/page';

export default function Home() {
  return (
    <div className={classNames('flex w-full flex-col items-center bg-gray-100')}>
      <DataPageHeader title="Headways" line="TBD" dateString="Today (TBD)" />
      <WidgetPage>
        <BasicDataWidgetPair>
          <BasicDataWidgetItem
            title="Median"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="This is where the explanation of the statistic will be placed."
          />
          <BasicDataWidgetItem
            title="Median"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="This is where the explanation of the statistic will be placed."
          />
        </BasicDataWidgetPair>{' '}
        <BasicDataWidgetPair>
          <BasicDataWidgetItem
            title="Median"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="This is where the explanation of the statistic will be placed."
          />
          <BasicDataWidgetItem
            title="New Trains"
            value="4"
            analysis="-1 from last Weds."
            explanation="This is where the explanation of the statistic will be placed."
            units="trains"
          />
        </BasicDataWidgetPair>
        <BasicDataWidgetPair>
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="Test"
          />
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="Test"
          />
        </BasicDataWidgetPair>
        <BasicDataWidgetPair>
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="Test"
          />
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="Test"
          />
        </BasicDataWidgetPair>
        <BasicDataWidgetPair>
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="Test"
          />
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="Test"
          />
        </BasicDataWidgetPair>
        <BasicDataWidgetPair>
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="Test"
          />
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="Test"
          />
        </BasicDataWidgetPair>
        <HomescreenWidgetTitle title="Headways" />
        <BasicDataWidgetItem
          title="Today"
          value="5:37"
          analysis="-0:12 from last Weds."
          explanation="Test"
        />
        <SlowZones line="Red" />
      </WidgetPage>
      <BottomNavBar line="<line>" section="<Section>" />
    </div>
  );
}
