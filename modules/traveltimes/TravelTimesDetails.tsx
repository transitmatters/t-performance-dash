'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useCustomQueries } from '../../common/api/datadashboard';
import { SingleDayAPIParams } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { getCurrentDate } from '../../common/utils/date';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageTravelTime } from '../../common/utils/traveltimes';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { TravelTimesSingleChart } from './charts/TravelTimesSingleChart';

export default function TravelTimesDetails() {
  const {
    linePath,
    lineShort,
    query: { startDate, busLine },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busLine);
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
      [SingleDayAPIParams.date]: startDate ?? getCurrentDate(),
    },
    false,
    startDate !== undefined && fromStopIds !== null && toStopIds !== null
  );

  const { traveltimes: traveltimesReversed } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIdsNorth || '',
      [SingleDayAPIParams.toStop]: toStopIdsNorth || '',
      [SingleDayAPIParams.stop]: fromStopIdsNorth || '',
      [SingleDayAPIParams.date]: startDate ?? getCurrentDate(),
    },
    false,
    startDate !== undefined && fromStopIds !== null && toStopIds !== null
  );

  if (traveltimes.isError || !linePath) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Avg. Travel Time"
          widgetValue={
            new TimeWidgetValue(
              traveltimes.data ? averageTravelTime(traveltimes.data) : undefined,
              1
            )
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
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
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <TravelTimesSingleChart
          traveltimes={traveltimes}
          fromStation={fromStation}
          toStation={toStation}
        />
      </div>
      <div className="flex w-full flex-row items-center justify-between text-lg">
        <h3>Return Trip</h3>
      </div>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <TravelTimesSingleChart
          traveltimes={traveltimesReversed}
          fromStation={toStation}
          toStation={fromStation}
        />
      </div>
    </>
  );
}
