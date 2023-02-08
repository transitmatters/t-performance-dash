'use client';
import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useDelimitatedRoute } from '../../common/utils/router';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { SZWidgetValue, TimeWidgetValue } from '../../common/types/basicWidgets';
import { useSlowZoneCalculations } from '../../common/utils/slowZoneUtils';
import { fetchAllSlow, fetchDelayTotals } from './api/slowzones';
import { TotalSlowTime } from './charts/TotalSlowTime';

export default function SlowZonesWidget() {
  const { line, linePath, lineShort } = useDelimitatedRoute();
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  const allSlow = useQuery(['allSlow'], fetchAllSlow);

  const formattedTotals = useMemo(
    () =>
      delayTotals.data && delayTotals.data.filter((t) => new Date(t.date) > new Date(2022, 0, 1)),
    [delayTotals.data]
  );

  const { current, lastWeek, totalDelay, totalDelayLasteek } = useSlowZoneCalculations({
    lineShort,
    allSlow: allSlow.data,
    formattedTotals,
  });

  if (delayTotals.isLoading || allSlow.isLoading || !line) {
    return <>Loading ... teehee</>;
  }

  if (delayTotals.isError || allSlow.isError) {
    return <>Uh oh... error</>;
  }

  if (line === 'BUS' || line === 'GL') {
    return null;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Slow Zones" href={`/${linePath}/slowzones`} />
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <div className={classNames('h-48 pr-4')}>
          <TotalSlowTime line={LINE_OBJECTS[line]?.short} data={formattedTotals} />
        </div>
        <div className={classNames('flex w-full flex-row space-x-8')}>
          <BasicWidgetDataLayout
            title="Total Delay"
            widgetValue={new TimeWidgetValue(totalDelay, totalDelay - totalDelayLasteek)}
            analysis={`from last ${dayjs().format('ddd')}.`}
          />
          <BasicWidgetDataLayout
            title="# Slow Zones"
            widgetValue={new SZWidgetValue(current, current && lastWeek ? current - lastWeek : 0)}
            analysis={`from last ${dayjs().format('ddd')}.`}
          />
        </div>
      </div>
    </>
  );
}
