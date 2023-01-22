'use client';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { fetchAllSlow, fetchDelayTotals } from '../../api/slowzones';
import { HomescreenWidgetTitle } from '../../components/widgets/HomescreenWidgetTitle';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { BasicWidgetDataLayout } from '../../components/widgets/internal/BasicWidgetDataLayout';
import { TotalSlowTime } from '../../components/slowzones/charts/TotalSlowTime';

interface SlowZoneProps {
  line: string;
}

export default function SlowZones({ line }: SlowZoneProps) {
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
      <HomescreenWidgetTitle title="Slow zones" />
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
