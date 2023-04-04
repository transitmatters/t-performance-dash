'use client';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { fetchAggregateData, fetchSingleDayData } from '../../common/api/datadashboard';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { AggregateAPIParams, QueryNameKeys, SingleDayAPIParams } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageDwells, longestDwells } from '../../common/utils/dwells';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { StationSelectorWidget } from '../../common/components/widgets/StationSelectorWidget';
import { LayoutType } from '../../common/layouts/layoutTypes';
import { DwellsSingleChart } from './charts/DwellsSingleChart';
import { DwellsAggregateChart } from './charts/DwellsAggregateChart';

export default function DwellsDetails() {
  const {
    lineShort,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort);

  const [toStation, setToStation] = useState(stations?.[stations.length - 3]);
  const [fromStation, setFromStation] = useState(stations?.[3]);

  const { fromStopIds } = stopIdsForStations(fromStation, toStation);

  const aggregate = startDate !== undefined && endDate !== undefined;
  const enabled = fromStopIds !== null && startDate !== null;
  const parameters: SingleDayAPIOptions | AggregateAPIOptions = aggregate
    ? {
        [AggregateAPIParams.stop]: fromStopIds,
        [AggregateAPIParams.startDate]: startDate,
        [AggregateAPIParams.endDate]: endDate,
      }
    : {
        [SingleDayAPIParams.stop]: fromStopIds,
        [SingleDayAPIParams.date]: startDate,
      };

  const dwells = useQuery({
    queryKey: [QueryNameKeys.dwells, aggregate, fromStopIds, startDate],
    enabled: !aggregate && enabled,
    queryFn: () => fetchSingleDayData(QueryNameKeys.dwells, parameters),
  });
  const dwellsAggregate = useQuery({
    queryKey: [QueryNameKeys.dwells, aggregate, fromStopIds, startDate, endDate],
    enabled: aggregate && enabled,
    queryFn: () => fetchAggregateData(QueryNameKeys.dwells, parameters),
  });

  const dwellsData = aggregate ? dwellsAggregate?.data?.by_date : dwells?.data;

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
          widgetValue={new TimeWidgetValue(dwellsData ? averageDwells(dwellsData) : undefined, 1)}
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
        <BasicDataWidgetItem
          title="Longest Dwell"
          widgetValue={new TimeWidgetValue(dwellsData ? longestDwells(dwellsData) : undefined, 1)}
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        {aggregate ? (
          <DwellsAggregateChart
            dwells={dwellsAggregate}
            toStation={toStation}
            fromStation={fromStation}
          />
        ) : (
          <DwellsSingleChart dwells={dwells} toStation={toStation} fromStation={fromStation} />
        )}
      </div>
    </>
  );
}
DwellsDetails.Layout = LayoutType.Metrics;
