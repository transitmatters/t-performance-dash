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
import { useDelimitatedRoute } from '../../common/utils/router';
import type { Location } from '../../common/types/charts';
import Device from '../../common/components/general/Device/Device';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';

export const HeadwaysWidget: React.FC = () => {
  const startDate = getCurrentDate();
  const route = useDelimitatedRoute();

  const stations = optionsStation(route.lineShort);
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

  const averageHeadways = useMemo(() => {
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

  const longestHeadway = useMemo(() => {
    if (headways && headways.data && headways.data.length >= 1) {
      const allHeadways = headways?.data
        .map((trip) => trip.headway_time_sec)
        .filter((headway) => headway !== undefined) as number[];
      return Math.max(...allHeadways);
    } else {
      return 0;
    }
  }, [headways]);

  const location: Location = useMemo(() => {
    if (toStation === undefined || fromStation === undefined) {
      return {
        to: toStation?.stop_name || 'Loading...',
        from: fromStation?.stop_name || 'Loading...',
        direction: 'southbound',
        line: route.lineShort,
      };
    }

    return {
      to: toStation.stop_name,
      from: fromStation.stop_name,
      direction: 'southbound',
      line: route.lineShort,
    };
  }, [fromStation, route, toStation]);

  const isLoading = headways.isLoading || toStation === undefined || fromStation === undefined;

  if (headways.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Headways" href={`/${route.line}/headways`} />
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <Device>
          {({ isMobile }) => (
            <SingleDayLineChart
              chartId={`headways-widget-${route.line}`}
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
          )}
        </Device>
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
            value={secondsToMinutes(longestHeadway).toString()}
            units="min"
            analysis="+1.0 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
        </div>
      </div>
    </>
  );
};
