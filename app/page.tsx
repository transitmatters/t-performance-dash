'use client';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { fetchDelayTotals } from '../api/slowzones';
import { TotalSlowTime } from '../components/slowzones/charts/TotalSlowTime';
import { classNames } from '../components/utils/tailwind';
import { WidgetBox, WidgetPage } from '../components/widgets/WidgetBox';
import { BasicDataWidgetItem } from '../components/widgets/BasicDataWidgetItem';
import { BasicDataWidgetPair } from '../components/widgets/BasicDataWidgetPair';
import { DataPageHeader } from '../components/general/DataPageHeader';

export default function Home() {
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);

  return (
    <div className={classNames('flex w-full flex-col items-center')}>
      <DataPageHeader title="Headways">
        <p>placeholder</p>
      </DataPageHeader>
      <WidgetPage>
        <BasicDataWidgetPair>
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="This is where the explanation of the statistic will be placed."
          />
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="This is where the explanation of the statistic will be placed."
          />
        </BasicDataWidgetPair>{' '}
        <BasicDataWidgetPair>
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="This is where the explanation of the statistic will be placed."
          />
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="This is where the explanation of the statistic will be placed."
          />
        </BasicDataWidgetPair>
        <WidgetBox title="Headways">
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="This is where the explanation of the statistic will be placed."
          />
        </WidgetBox>
        <WidgetBox title="Travel Times">
          <BasicDataWidgetItem
            title="Today"
            value="5:37"
            analysis="-0:12 from last Weds."
            explanation="This is where the explanation of the statistic will be placed."
          />
        </WidgetBox>
        <WidgetBox title="Slow Zones">
          <div className={classNames('flex-grow-1 flex rounded border border-mbta-lighterRed p-4')}>
            {/* {delayTotals.data && (
            <TotalSlowTime
              data={delayTotals.data.filter((t) => new Date(t.date) > new Date(2020, 0, 1)) || []}
            />
          )} */}
          </div>
        </WidgetBox>
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
      </WidgetPage>
    </div>
  );
}
