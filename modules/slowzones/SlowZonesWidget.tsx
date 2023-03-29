'use client';
import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { getSlowZoneDeltas } from '../../common/utils/slowZoneUtils';
import { TODAY_UTC } from '../../common/components/inputs/DateSelection/DateConstants';
import { WidgetDataLayoutNoComparison } from '../../common/components/widgets/internal/WidgetDataLayoutNoComparison';
import { fetchAllSlow, fetchDelayTotals } from './api/slowzones';
import { TotalSlowTime } from './charts/TotalSlowTime';

export default function SlowZonesWidget() {
  const { line, linePath, lineShort } = useDelimitatedRoute();
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  const allSlow = useQuery(['allSlowOverview'], fetchAllSlow);

  const formattedTotals = useMemo(
    () =>
      delayTotals.data && delayTotals.data.filter((t) => new Date(t.date) > new Date(2022, 0, 1)),
    [delayTotals.data]
  );

  const { delayDelta } = getSlowZoneDeltas({
    lineShort,
    allSlow: allSlow.data,
    endDateUTC: TODAY_UTC,
    startDateUTC: dayjs.utc('2022-1-1'),
    totals: formattedTotals,
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
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HomescreenWidgetTitle title="Slow Zones" href={`/${linePath}/slowzones`} />
        <div className={classNames('flex w-full flex-row')}>
          <WidgetDataLayoutNoComparison
            title="Delay"
            widgetValue={new TimeWidgetValue(delayDelta, delayDelta)}
            analysis={`from last ${dayjs().format('ddd')}.`}
          />
        </div>
        <div className={classNames('h-48 pr-4')}>
          <TotalSlowTime
            data={formattedTotals}
            startDate={dayjs('2022-06-01')}
            endDate={TODAY_UTC}
          />
        </div>
      </div>
    </>
  );
}
