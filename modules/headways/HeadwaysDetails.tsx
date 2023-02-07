'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useCustomQueries } from '../../common/api/datadashboard';
import { SingleDayLineChart } from '../../common/components/charts/SingleDayLineChart';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { SingleDayAPIParams } from '../../common/types/api';
import { locationDetails, optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { getCurrentDate } from '../../common/utils/date';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageHeadway, longestHeadway } from '../../common/utils/headways';
import { TimeWidgetValue } from '../../common/types/basicWidgets';

export default function HeadwaysDetails() {
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

  const { headways: headwaysReversed } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIdsNorth || '',
      [SingleDayAPIParams.toStop]: toStopIdsNorth || '',
      [SingleDayAPIParams.stop]: fromStopIdsNorth || '',
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    fromStopIdsNorth !== null && toStopIdsNorth !== null
  );

  const isLoading = headways.isLoading || toStation === undefined || fromStation === undefined;

  if (headways.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Average Headway"
          widgetValue={
            new TimeWidgetValue(headways.data ? averageHeadway(headways.data) : undefined, 1)
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
        <BasicDataWidgetItem
          title="Longest Headway"
          widgetValue={
            new TimeWidgetValue(headways.data ? longestHeadway(headways.data) : undefined, 1)
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <SingleDayLineChart
          chartId={`headways-widget-${linePath}`}
          title={'Time between trains (headways)'}
          data={headways.data ?? []}
          date={startDate}
          metricField={MetricFieldKeys.headWayTimeSec}
          pointField={PointFieldKeys.currentDepDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
          isLoading={isLoading}
          location={locationDetails(fromStation, toStation, lineShort)}
          fname={'headways'}
        />
      </div>
      <div className="flex w-full flex-row items-center justify-between text-lg">
        <h3>Return Trip</h3>
      </div>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <SingleDayLineChart
          chartId={`headways-widget-${linePath}-return`}
          title={'Time between trains (headways)'}
          data={headwaysReversed.data ?? []}
          date={startDate}
          metricField={MetricFieldKeys.headWayTimeSec}
          pointField={PointFieldKeys.currentDepDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
          isLoading={isLoading}
          location={locationDetails(toStation, fromStation, lineShort)}
          fname={'headways'}
        />
      </div>
    </>
  );
}
