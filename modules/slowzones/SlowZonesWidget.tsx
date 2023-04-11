'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { fetchDelayTotals } from '../../common/api/slowzones';
import { TotalSlowTimeWrapper } from './TotalSlowTimeWrapper';
dayjs.extend(utc);

export default function SlowZonesWidget() {
  const { line, linePath, lineShort } = useDelimitatedRoute();
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);

  const startDateUTC = dayjs.utc('2022-01-01').startOf('day');
  const endDateUTC = dayjs.utc().startOf('day');
  const totalSlowTimeReady =
    !delayTotals.isError && delayTotals.data && startDateUTC && endDateUTC && lineShort && line;

  if (line === 'BUS' || line === 'GL') {
    return null;
  }
  return (
    <>
      <div className={classNames('relative h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HomescreenWidgetTitle title="Slow Zones" href={`/${linePath}/slowzones`} />
        {totalSlowTimeReady ? (
          <TotalSlowTimeWrapper
            data={delayTotals.data}
            startDateUTC={startDateUTC}
            endDateUTC={endDateUTC}
            line={line}
            lineShort={lineShort}
          />
        ) : (
          <ChartPlaceHolder query={delayTotals} />
        )}
      </div>
    </>
  );
}
