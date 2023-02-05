'use client';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSlow, fetchDelayTotals } from '../../api/slowzones';
import { TotalSlowTime } from '../slowzones/charts/TotalSlowTime';
import { useDelimitatedRoute } from '../utils/router';
import { classNames } from '../utils/tailwind';
import { LINE_OBJECTS } from '../../constants/lines';
import { BasicWidgetDataLayout } from './internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from './HomescreenWidgetTitle';

export default function SlowZonesWidget() {
  const route = useDelimitatedRoute();
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  const allSlow = useQuery(['allSlow'], fetchAllSlow);

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
      <HomescreenWidgetTitle title="Slow Zones" href={`/${route.line}/slowzones`} />
      <div className={classNames('bg-white p-2 shadow-dataBox')}>
        <div className={classNames('h-48 pr-4')}>
          <TotalSlowTime line={LINE_OBJECTS[route.line]?.short} data={data} />
        </div>
        <div className={classNames('flex w-full flex-row space-x-8')}>
          <BasicWidgetDataLayout
            title="Total Delay"
            value={data && data[data.length - 1][LINE_OBJECTS[route.line]?.short]}
            unit="time"
            analysis="since last week"
            delta={60}
          />
          <BasicWidgetDataLayout
            title="# Slow Zones"
            value={7}
            unit="quantity"
            analysis="since last week"
            delta={-2}
          />
        </div>
      </div>
    </>
  );
}
