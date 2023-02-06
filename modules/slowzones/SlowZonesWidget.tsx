'use client';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { useDelimitatedRoute } from '../../common/utils/router';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { fetchAllSlow, fetchDelayTotals } from './api/slowzones';
import { TotalSlowTime } from './charts/TotalSlowTime';

export default function SlowZonesWidget() {
  const { line, linePath } = useDelimitatedRoute();
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  const allSlow = useQuery(['allSlow'], fetchAllSlow);

  const data = useMemo(
    () =>
      delayTotals.data && delayTotals.data.filter((t) => new Date(t.date) > new Date(2022, 0, 1)),
    [delayTotals.data]
  );

  if (delayTotals.isLoading || allSlow.isLoading || !line) {
    return <>Loading ... teehee</>;
  }

  if (delayTotals.isError || allSlow.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Slow Zones" href={`/${linePath}/slowzones`} />
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <div className={classNames('h-48 pr-4')}>
          <TotalSlowTime line={LINE_OBJECTS[line]?.short} data={data} />
        </div>
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Total Delay"
            value={data && (data[data.length - 1][LINE_OBJECTS[line]?.short] / 60).toFixed(2)}
            units="min"
            analysis="+1.0 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
          <BasicWidgetDataLayout
            title="# Slow Zones"
            value="7"
            units="zones"
            analysis="+2 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
        </div>
      </div>
    </>
  );
}
