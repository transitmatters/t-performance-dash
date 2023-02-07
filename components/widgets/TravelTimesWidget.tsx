'use client';
import React from 'react';
import classNames from 'classnames';
import { SingleDayLineChart } from '../dashboard/charts/SingleDayLineChart';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { SingleDayAPIParams } from '../../types/api';
import { stopIdsForStations } from '../../utils/stations';
import { useCustomQueries } from '../../api/datadashboard';
import { Station } from '../../types/stations';
import { useDelimitatedRoute } from '../utils/router';
import { getCurrentDate } from '../../utils/date';
import { LINE_OBJECTS } from '../../constants/lines';
import { BasicWidgetDataLayout } from './internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from './HomescreenWidgetTitle';

export const TravelTimesWidget: React.FC = () => {
  const startDate = getCurrentDate();

  const fromStation: Station = {
    stop_name: 'Kendall/MIT',
    branches: ['A', 'B'],
    station: 'place-knncl',
    order: 6,
    stops: {
      '0': ['70072'],
      '1': ['70071'],
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
  const averageTravelTime: number = React.useMemo(() => {
    if (traveltimes && traveltimes.data) {
      const totalSum = traveltimes?.data
        ?.map((trip) => trip.travel_time_sec)
        ?.reduce((a, b) => {
          if (a && b) {
            return a + b;
          } else {
            return 0;
          }
        }, 0);
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
      <HomescreenWidgetTitle
        title="Travel Times"
        href={`/${LINE_OBJECTS[route.line].path}/traveltimes`}
      />
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
        <div className={classNames('flex w-full flex-row space-x-8')}>
          <BasicWidgetDataLayout
            title="Average Travel Time"
            value={averageTravelTime}
            unit="time"
            analysis="since last week"
            delta={1}
          />
          <BasicWidgetDataLayout
            title="Round Trip"
            value={averageTravelTime * 2} //TODO: Show real time for a round trip
            unit="time"
            analysis="since last week"
            delta={2}
          />
        </div>
      </div>
    </>
  );
};
