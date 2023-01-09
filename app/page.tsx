'use client';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { fetchDelayTotals } from '../api/slowzones';
import { TotalSlowTime } from '../components/slowzones/charts/TotalSlowTime';
import { classNames } from '../components/utils/tailwind';
import { WidgetPage } from '../components/widgets/Widget';
import { BasicDataWidgetItem } from '../components/widgets/BasicDataWidgetItem';
import { BasicDataWidgetPair } from '../components/widgets/BasicDataWidgetPair';
import { DataPageHeader } from '../components/widgets/DataPageHeader';
import { HomescreenWidgetTitle } from '../components/widgets/HomescreenWidgetTitle';

export default function Home() {
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);

  return (
    <div className={classNames('flex w-full flex-col items-center')}>
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
        <HomescreenWidgetTitle title="Headways" />
        <BasicDataWidgetItem
          title="Today"
          value="5:37"
          analysis="-0:12 from last Weds."
          explanation="Test"
        />
      </WidgetPage>
    </div>
  );
}
