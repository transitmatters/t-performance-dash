'use client';
import React from 'react';
import dayjs from 'dayjs';
import { useCustomQueries } from '../../common/api/datadashboard';
import { SingleDayAPIParams } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageDwells, longestDwells } from '../../common/utils/dwells';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { DwellsSingleChart } from './charts/DwellsSingleChart';

export default function DwellsDetails() {
  const {
    lineShort,
    query: { startDate },
  } = useDelimitatedRoute();

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
      [SingleDayAPIParams.fromStop]: fromStopIds,
      [SingleDayAPIParams.toStop]: toStopIds,
      [SingleDayAPIParams.stop]: fromStopIds,
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    startDate !== undefined && fromStopIds !== null && toStopIds !== null
  );

  const { dwells: dwellsReversed } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIdsNorth,
      [SingleDayAPIParams.toStop]: toStopIdsNorth,
      [SingleDayAPIParams.stop]: fromStopIdsNorth,
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    startDate !== undefined && fromStopIdsNorth !== null && toStopIdsNorth !== null
  );

  if (dwells.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Average Dwell"
          widgetValue={new TimeWidgetValue(dwells.data ? averageDwells(dwells.data) : undefined, 1)}
          analysis={`from last ${dayjs().format('ddd')}.`}
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
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <DwellsSingleChart
          dwells={dwells}
          toStation={toStation}
          fromStation={fromStation}
          showLegend={true}
        />
      </div>
      <div className="flex w-full flex-row items-center justify-between text-lg">
        <h3>Return Trip</h3>
      </div>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <DwellsSingleChart
          dwells={dwellsReversed}
          toStation={fromStation}
          fromStation={toStation}
          showLegend={true}
        />
      </div>
    </>
  );
}
