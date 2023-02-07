'use client';

import React from 'react';
import { useCustomQueries } from '../../common/api/datadashboard';
import { SingleDayLineChart } from '../../common/components/charts/SingleDayLineChart';
import { MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { SingleDayAPIParams } from '../../common/types/api';
import { locationDetails, optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { getCurrentDate } from '../../common/utils/date';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageDwells, longestDwells } from '../../common/utils/dwells';
import { TimeWidgetValue } from '../../common/types/basicWidgets';

export default function DwellsDetails() {
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

  const { dwells } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIds || '',
      [SingleDayAPIParams.toStop]: toStopIds || '',
      [SingleDayAPIParams.stop]: fromStopIds || '',
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    fromStopIds !== null && toStopIds !== null
  );

  const { dwells: dwellsReversed } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIdsNorth || '',
      [SingleDayAPIParams.toStop]: toStopIdsNorth || '',
      [SingleDayAPIParams.stop]: fromStopIdsNorth || '',
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    fromStopIdsNorth !== null && toStopIdsNorth !== null
  );

  const isLoading = dwells.isLoading || toStation === undefined || fromStation === undefined;

  if (dwells.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Average Dwell"
          widgetValue={new TimeWidgetValue(dwells.data ? averageDwells(dwells.data) : undefined, 1)}
          analysis="since last week"
        />
        <BasicDataWidgetItem
          title="Longest Dwell"
          widgetValue={
            new TimeWidgetValue(
              dwells.data && dwellsReversed.data
                ? Math.max(longestDwells(dwells.data), longestDwells(dwellsReversed.data))
                : undefined,
              1
            )
          }
          analysis="since last week"
        />
      </BasicDataWidgetPair>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <SingleDayLineChart
          chartId={`dwells-widget-${linePath}`}
          title={'Time spent at station (dwells)'}
          data={dwells.data ?? []}
          date={startDate}
          metricField={MetricFieldKeys.dwellTimeSec}
          pointField={PointFieldKeys.arrDt}
          isLoading={isLoading}
          location={locationDetails(fromStation, toStation, lineShort)}
          fname={'dwells'}
          showLegend={false}
        />
      </div>
      <div className="flex w-full flex-row items-center justify-between text-lg">
        <h3>Return Trip</h3>
      </div>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <SingleDayLineChart
          chartId={`dwells-widget-${linePath}-return`}
          title={'Time spent at station (dwells)'}
          data={dwellsReversed.data ?? []}
          date={startDate}
          metricField={MetricFieldKeys.dwellTimeSec}
          pointField={PointFieldKeys.arrDt}
          isLoading={isLoading}
          location={locationDetails(toStation, fromStation, lineShort)}
          fname={'dwells'}
          showLegend={false}
        />
      </div>
    </>
  );
}
