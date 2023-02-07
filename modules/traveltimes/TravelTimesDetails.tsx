'use client';

import React from 'react';
import { secondsToMinutes } from 'date-fns';
import { useCustomQueries } from '../../common/api/datadashboard';
import { SingleDayLineChart } from '../../common/components/charts/SingleDayLineChart';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { SingleDayAPIParams } from '../../common/types/api';
import { locationDetails, optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { getCurrentDate } from '../../common/utils/date';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageTravelTime } from '../../common/utils/traveltimes';
import { TimeWidgetValue } from '../../common/types/basicWidgets';

export default function TravelTimesDetails() {
  const startDate = getCurrentDate();
  const { linePath, lineShort } = useDelimitatedRoute();

  const stations = optionsStation(lineShort);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const { fromStopIds: fromStopIdsNorth, toStopIds: toStopIdsNorth } = stopIdsForStations(
    toStation,
    fromStation
  );

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

  const { traveltimes: traveltimesReversed } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIdsNorth || '',
      [SingleDayAPIParams.toStop]: toStopIdsNorth || '',
      [SingleDayAPIParams.stop]: fromStopIdsNorth || '',
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    fromStopIdsNorth !== null && toStopIdsNorth !== null
  );

  const isLoading = traveltimes.isLoading || toStation === undefined || fromStation === undefined;

  if (traveltimes.isError || !linePath) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Average Travel Time"
          widgetValue={
            new TimeWidgetValue(
              traveltimes.data ? averageTravelTime(traveltimes.data) : undefined,
              1
            )
          }
          analysis="since last week"
        />
        <BasicDataWidgetItem
          title="Round Trip"
          widgetValue={
            new TimeWidgetValue(
              traveltimes.data && traveltimesReversed.data
                ? averageTravelTime(traveltimes.data) + averageTravelTime(traveltimesReversed.data)
                : undefined,
              1
            )
          }
          analysis="since last week"
        />
      </BasicDataWidgetPair>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <SingleDayLineChart
          chartId={`traveltimes-widget-${linePath}`}
          title={'Travel Times'}
          data={traveltimes.data || []}
          date={startDate}
          metricField={MetricFieldKeys.travelTimeSec}
          pointField={PointFieldKeys.depDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
          isLoading={isLoading}
          bothStops={true}
          location={locationDetails(fromStation, toStation, lineShort)}
          fname={'traveltimes'}
        />
      </div>
      <div className="flex w-full flex-row items-center justify-between text-lg">
        <h3>Return Trip</h3>
      </div>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <SingleDayLineChart
          chartId={`traveltimes-widget-${linePath}-return`}
          title={'Travel Times'}
          data={traveltimesReversed.data || []}
          date={startDate}
          metricField={MetricFieldKeys.travelTimeSec}
          pointField={PointFieldKeys.depDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
          isLoading={isLoading}
          bothStops={true}
          location={locationDetails(toStation, fromStation, lineShort)}
          fname={'traveltimes'}
        />
      </div>
    </>
  );
}
