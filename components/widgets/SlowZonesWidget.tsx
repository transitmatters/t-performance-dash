'use client';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { fetchAllSlow, fetchDelayTotals } from '../../api/slowzones';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { TotalSlowTime } from '../slowzones/charts/TotalSlowTime';
import { useSelectedStore } from '../../stores/useSelected';
import { BasicWidgetDataLayout } from './internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from './HomescreenWidgetTitle';

export default function SlowZones() {
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  const allSlow = useQuery(['allSlow'], fetchAllSlow);

  const line = useSelectedStore((state) => state.line.short);
  const data = useMemo(
    () =>
      delayTotals.data && delayTotals.data.filter((t) => new Date(t.date) > new Date(2022, 0, 1)),
    [delayTotals.data]
  );

  if (delayTotals.isLoading || allSlow.isLoading) {
    return <>Loading ... teehee</>;
  }

  if (delayTotals.isError || allSlow.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Slow zones" href="/slowzones" />
      <div className={classNames('bg-white p-2 shadow-dataBox')}>
        <div className={classNames('h-48 pr-4')}>
          <TotalSlowTime line={line} data={data} />
        </div>
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Total Delay"
            value={data && (data[data.length - 1][line] / 60).toFixed(2)}
            units="min"
            analysis="+1.0 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
          <BasicWidgetDataLayout
            title="# Slow Zones"
            value="7"
            units="min"
            analysis="+2 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
        </div>
      </div>
    </>
  );
}
