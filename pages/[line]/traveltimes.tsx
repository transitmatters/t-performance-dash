'use client';

import React from 'react';
import { useCustomQueries } from '../../api/datadashboard';
import { SingleDayLineChart } from '../../components/dashboard/charts/SingleDayLineChart';
import { useDelimitatedRoute } from '../../components/utils/router';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { SingleDayAPIParams } from '../../types/api';
import { getCurrentDate } from '../../utils/date';
import { optionsStation, stopIdsForStations } from '../../utils/stations';

export default function TravelTimes() {
  const startDate = getCurrentDate();

  const route = useDelimitatedRoute();

  const stations = optionsStation(route.lineShort);
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

  if (toStation === undefined || fromStation === undefined) {
    return <>Loading ... teehee</>;
  }

  if (traveltimes.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
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
          location={{
            to: toStation.stop_name,
            from: fromStation.stop_name,
            direction: 'southbound',
            line: route.lineShort,
          }}
          fname={'traveltimes'}
        />
      </div>
    </>
  );
}
