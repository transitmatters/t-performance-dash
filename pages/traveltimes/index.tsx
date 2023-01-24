'use client';

import React from 'react';
import { useCustomQueries } from '../../api/datadashboard';
import { SingleDayLineChart } from '../../components/dashboard/charts/SingleDayLineChart';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { SingleDayAPIKeys } from '../../types/api';
import { Station } from '../../types/stations';
import { stopIdsForStations } from '../../utils/stations';

export default function TravelTimes() {
  const startDate = '2023-01-23';

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

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const { traveltimes } = useCustomQueries(
    {
      [SingleDayAPIKeys.fromStop]: fromStopIds,
      [SingleDayAPIKeys.toStop]: toStopIds,
      [SingleDayAPIKeys.stop]: fromStopIds,
      [SingleDayAPIKeys.date]: startDate,
    },
    false
  );

  if (traveltimes.isLoading) {
    return <>Loading ... teehee</>;
  }

  if (traveltimes.isError) {
    return <>Uh oh... error</>;
  }

  return (
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
  );
}
