'use client';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { fetchSingleDayData } from '../../common/api/datadashboard';
import { QueryNameKeys } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageDwells, longestDwells } from '../../common/utils/dwells';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { StationSelectorWidget } from '../../common/components/widgets/StationSelectorWidget';
import { DwellsSingleChart } from './charts/DwellsSingleChart';

export default function DwellsDetails() {
  const {
    lineShort,
    query: { startDate },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort);

  const [toStation, setToStation] = useState(stations?.[stations.length - 3]);
  const [fromStation, setFromStation] = useState(stations?.[3]);

  const { fromStopIds } = stopIdsForStations(fromStation, toStation);

  const dwells = useQuery([fromStopIds, startDate], () =>
    fetchSingleDayData(QueryNameKeys.dwells, { date: startDate, stop: fromStopIds })
  );

  if (dwells.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      {fromStation && toStation ? (
        <StationSelectorWidget
          fromStation={fromStation}
          toStation={toStation}
          setFromStation={setFromStation}
          setToStation={setToStation}
        />
      ) : null}
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Average Dwell"
          widgetValue={new TimeWidgetValue(dwells.data ? averageDwells(dwells.data) : undefined, 1)}
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
        <BasicDataWidgetItem
          title="Longest Dwell"
          widgetValue={new TimeWidgetValue(dwells.data ? longestDwells(dwells.data) : undefined, 1)}
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <DwellsSingleChart dwells={dwells} toStation={toStation} fromStation={fromStation} />
      </div>
      <div className="flex w-full flex-row items-center justify-between text-lg">
        <h3>Return Trip</h3>
      </div>
    </>
  );
}
