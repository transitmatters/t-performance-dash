'use client';
import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { useSlowZoneCalculations } from '../../common/utils/slowZoneUtils';
import type { TimeRange } from '../../common/types/inputs';
import { DATE_FORMAT } from '../../common/components/inputs/DateSelection/DateConstants';
import { fetchAllSlow, fetchDelayTotals } from './api/slowzones';
import { TotalSlowTime } from './charts/TotalSlowTime';

interface SlowZonesWidgetProps {
  timeRange: TimeRange;
}

const today = dayjs();
const endDate = today.format(DATE_FORMAT);
const rangeToParams = {
  week: {
    endDate: endDate,
    startDate: today.subtract(6, 'days'),
    comparisonStartDate: today.subtract(13, 'days').format(DATE_FORMAT),
    tooltipFormat: 'MMM d, yyyy',
    unit: 'day',
  },
  month: {
    endDate: endDate,
    startDate: today.subtract(30, 'days'),
    comparisonStartDate: today.subtract(60, 'days').format(DATE_FORMAT),
    tooltipFormat: 'MMM d, yyyy',
    unit: 'day',
  },
  year: {
    endDate: endDate,
    startDate: today.subtract(1, 'years'),
    comparisonStartDate: today.subtract(2, 'years').format(DATE_FORMAT),
    tooltipFormat: 'MMM d, yyyy',
    unit: 'month',
  },
  all: {
    endDate: endDate,
    startDate: dayjs('2016-01-01'),
    comparisonStartDate: today.subtract(2, 'years').format(DATE_FORMAT), // TODO: better comparison for all times (?)
    tooltipFormat: 'MMM yyyy',
    unit: 'year',
  },
};

export const SlowZonesWidget: React.FC<SlowZonesWidgetProps> = ({ timeRange }) => {
  const { line, linePath, lineShort } = useDelimitatedRoute();
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  const allSlow = useQuery(['allSlow'], fetchAllSlow);
  const { startDate, endDate, comparisonStartDate } = rangeToParams[timeRange];

  const formattedTotals = useMemo(
    () =>
      delayTotals.data &&
      delayTotals.data.filter((t) => {
        return dayjs(t.date).isAfter(startDate);
      }),
    [delayTotals.data, startDate]
  );
  const { current, totalDelay } = useSlowZoneCalculations({
    lineShort,
    allSlow: allSlow.data,
    formattedTotals,
  });

  if (delayTotals.isError || allSlow.isError) {
    return <>Uh oh... error</>;
  }

  if (line === 'BUS' || line === 'GL') {
    return null;
  }

  return (
    <>
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HomescreenWidgetTitle title="Slow Zones" href={`/${linePath}/slowzones`} />
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Total Delay today"
            widgetValue={new TimeWidgetValue(totalDelay, 0)}
            analysis={``}
          />
        </div>
        <div className={classNames('h-48 pr-4')}>
          <TotalSlowTime data={formattedTotals} />
        </div>
      </div>
    </>
  );
};
