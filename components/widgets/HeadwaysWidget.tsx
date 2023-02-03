'use client';
import React from 'react';
import classNames from 'classnames';
import { secondsToMinutes } from 'date-fns';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { SingleDayLineChart } from '../dashboard/charts/SingleDayLineChart';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { SingleDayAPIParams } from '../../types/api';
import { optionsStation, stopIdsForStations } from '../../utils/stations';
import { useCustomQueries } from '../../api/datadashboard';
import { getCurrentDate } from '../../utils/date';
import { useDelimitatedRoute } from '../utils/router';
import { BasicWidgetDataLayout } from './internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from './HomescreenWidgetTitle';

export const HeadwaysWidget: React.FC = () => {
  const startDate = getCurrentDate();
  const route = useDelimitatedRoute();

  const stations = optionsStation(route.line);
  const toStation = stations?.[stations.length - 1];
  const fromStation = stations?.[0];

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

  const averageHeadways = React.useMemo(() => {
    if (headways && headways.data && headways.data.length >= 1) {
      const totalSum = headways?.data
        .map((trip) => trip.headway_time_sec)
        .reduce((a, b) => {
          if (a && b) {
            return a + b;
          } else {
            return 0;
          }
        });
      return (totalSum || 0) / headways.data.length;
    } else {
      return 0;
    }
  }, [headways]);

  const isLoading = headways.isLoading || toStation === undefined || fromStation === undefined;

  if (headways.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Headways" href={`/${route.line}/headways`} />
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <SingleDayLineChart
          chartId={'headways'}
          title={'Time between trains (headways)'}
          data={headways.data || []}
          date={startDate}
          metricField={MetricFieldKeys.headWayTimeSec}
          pointField={PointFieldKeys.currentDepDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
          isLoading={isLoading}
          location={{
            to: toStation?.stop_name || 'Loading...',
            from: fromStation?.stop_name || 'Loading...',
            direction: 'southbound',
            line: route.linePath,
          }}
          fname={'headways'}
        />
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Headway"
            value={secondsToMinutes(averageHeadways).toString()}
            units="min"
            analysis="+1.0 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
          <BasicWidgetDataLayout
            title="Longest Headway"
            value={'22'}
            units="min"
            analysis="+1.0 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
        </div>
      </div>
    </>
  );
};
