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
import { useDelimitatedRoute } from '../utils/router';
import { getCurrentDate } from '../../utils/date';
import { LINE_OBJECTS } from '../../constants/lines';
import { BasicWidgetDataLayout } from './internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from './HomescreenWidgetTitle';

export const TravelTimesWidget: React.FC = () => {
  const startDate = getCurrentDate();

  const route = useDelimitatedRoute();

  const stations = optionsStation(route.line);
  const toStation = stations?.[stations.length - 1];
  const fromStation = stations?.[0];

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const { traveltimes } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIds || '',
      [SingleDayAPIParams.toStop]: toStopIds || '',
      [SingleDayAPIParams.stop]: fromStopIds || '',
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    fromStopIds !== null && toStopIds !== null
  );

  // TODO: If these error out, should only affect the widget, not the title.
  const averageTravelTime = React.useMemo(() => {
    if (traveltimes && traveltimes.data && traveltimes.data.length >= 1) {
      const totalSum = traveltimes?.data
        .map((trip) => trip.travel_time_sec)
        .reduce((a, b) => {
          if (a && b) {
            return a + b;
          } else {
            return 0;
          }
        });
      return (totalSum || 0) / traveltimes.data.length;
    } else {
      return 0;
    }
  }, [traveltimes]);

  const isLoading = traveltimes.isLoading || toStation === undefined || fromStation === undefined;

  if (traveltimes.isError || !route.line) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle
        title="Travel Times"
        href={`/${LINE_OBJECTS[route.line].path}/traveltimes`}
      />
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <SingleDayLineChart
          chartId={'traveltimes'}
          title={'Travel Times'}
          data={traveltimes.data || []}
          date={startDate}
          metricField={MetricFieldKeys.travelTimeSec}
          pointField={PointFieldKeys.depDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
          isLoading={isLoading}
          bothStops={true}
          location={{
            to: toStation?.stop_name || 'Loading...',
            from: fromStation?.stop_name || 'Loading...',
            direction: 'southbound',
            line: route.linePath,
          }}
          fname={'traveltimes'}
        />
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Travel Time"
            value={secondsToMinutes(averageTravelTime).toString()}
            units="min"
            analysis="+1.0 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
          <BasicWidgetDataLayout
            title="Round Trip"
            value={secondsToMinutes(averageTravelTime * 2).toString()} //TODO: Show real time for a round trip
            units="min"
            analysis="+2 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
        </div>
      </div>
    </>
  );
};
