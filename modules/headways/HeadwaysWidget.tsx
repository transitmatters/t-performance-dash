'use client';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { secondsToMinutes } from 'date-fns';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { SingleDayLineChart } from '../../common/components/charts/SingleDayLineChart';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { SingleDayAPIParams } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useCustomQueries } from '../../common/api/datadashboard';
import { getCurrentDate } from '../../common/utils/date';
import { averageHeadway, longestHeadway } from '../../common/utils/headways';
import { useDelimitatedRoute } from '../../common/utils/router';
import type { Location } from '../../common/types/charts';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';

export const HeadwaysWidget: React.FC = () => {
  const startDate = getCurrentDate();
  const { linePath, lineShort } = useDelimitatedRoute();
  const isMobile = !useBreakpoint('sm');

  const stations = optionsStation(lineShort);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const { headways } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIds || '',
      [SingleDayAPIParams.toStop]: toStopIds || '',
      [SingleDayAPIParams.stop]: fromStopIds || '',
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    fromStopIds !== null && toStopIds !== null
  );

  const location: Location = useMemo(() => {
    if (toStation === undefined || fromStation === undefined) {
      return {
        to: toStation?.stop_name || 'Loading...',
        from: fromStation?.stop_name || 'Loading...',
        direction: 'southbound',
        line: lineShort,
      };
    }

    return {
      to: toStation.stop_name,
      from: fromStation.stop_name,
      direction: 'southbound',
      line: lineShort,
    };
  }, [fromStation, lineShort, toStation]);

  const isLoading = headways.isLoading || toStation === undefined || fromStation === undefined;

  if (headways.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Headways" href={`/${linePath}/headways`} />
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <SingleDayLineChart
          chartId={`headways-widget-${linePath}`}
          title={'Time between trains (headways)'}
          data={headways.data ?? []}
          date={startDate}
          metricField={MetricFieldKeys.headWayTimeSec}
          pointField={PointFieldKeys.currentDepDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
          isLoading={isLoading}
          location={location}
          fname={'headways'}
          showLegend={!isMobile}
        />
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Headway"
            value={headways.data ? averageHeadway(headways.data) : 0} // todo: send null and loads
            unit="time"
            analysis="since last week"
            delta={1}
          />
          <BasicWidgetDataLayout
            title="Longest Headway"
            value={headways.data ? longestHeadway(headways.data) : 0}
            unit="time"
            analysis="since last week"
            delta={1}
          />
        </div>
      </div>
    </>
  );
};
