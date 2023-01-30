'use client';
import React from 'react';
import classNames from 'classnames';
import { secondsToMinutes } from 'date-fns';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { SingleDayLineChart } from '../dashboard/charts/SingleDayLineChart';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { SingleDayAPIParams } from '../../types/api';
import { stopIdsForStations } from '../../utils/stations';
import { useCustomQueries } from '../../api/datadashboard';
import { Station } from '../../types/stations';
import { useDelimitatedRoute } from '../utils/router';
import { getCurrentDate } from '../../utils/date';
import { BasicWidgetDataLayout } from './internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from './HomescreenWidgetTitle';
import { LINE_OBJECTS } from '../../constants/lines';

export const TravelTimesWidget: React.FC = () => {
  const startDate = getCurrentDate();

  const fromStation: Station = {
    stop_name: 'Davis',
    branches: ['A', 'B'],
    station: 'place-davis',
    order: 2,
    stops: {
      '0': ['70064'],
      '1': ['70063'],
    },
  };
  const toStation: Station = {
    stop_name: 'Downtown Crossing',
    branches: ['A', 'B'],
    station: 'place-dwnxg',
    order: 9,
    stops: {
      '0': ['70078'],
      '1': ['70077'],
    },
  };

  const route = useDelimitatedRoute();

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const { traveltimes } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIds,
      [SingleDayAPIParams.toStop]: toStopIds,
      [SingleDayAPIParams.stop]: fromStopIds,
      [SingleDayAPIParams.date]: startDate,
    },
    false
  );

  // TODO: If these error out, should only affect the widget, not the title.
  const averageTravelTime = React.useMemo(() => {
    if (traveltimes && traveltimes.data) {
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

  if (traveltimes.isLoading) {
    return <>Loading ... teehee</>;
  }

  if (traveltimes.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Travel Times" href={`/${LINE_OBJECTS[route.line]?.path}/traveltimes`} />
      <div className={classNames('bg-white p-2 shadow-dataBox')}>
        <div className={'charts main-column'}>
          <SingleDayLineChart
            chartId={'traveltimes'}
            title={'Travel Times'}
            data={traveltimes.data || []}
            date={startDate}
            metricField={MetricFieldKeys.travelTimeSec}
            pointField={PointFieldKeys.depDt}
            benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
            isLoading={traveltimes.isLoading}
            bothStops={true}
            location={'todo'}
            fname={'todo'}
          />
        </div>
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
