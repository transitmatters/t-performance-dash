'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useCustomQueries } from '../../common/api/datadashboard';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageTravelTime } from '../../common/utils/traveltimes';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { TravelTimesSingleChart } from './charts/TravelTimesSingleChart';
import { TravelTimesAggregateChart } from './charts/TravelTimesAggregateChart';

export default function TravelTimesDetails() {
  const {
    linePath,
    lineShort,
    query: { startDate, endDate, busLine },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busLine);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const { fromStopIds: fromStopIdsNorth, toStopIds: toStopIdsNorth } = stopIdsForStations(
    toStation,
    fromStation
  );

  const aggregate = startDate !== undefined && endDate !== undefined;
  const parameters: SingleDayAPIOptions | AggregateAPIOptions = aggregate
    ? {
        [AggregateAPIParams.fromStop]: fromStopIds,
        [AggregateAPIParams.toStop]: toStopIds,
        [AggregateAPIParams.startDate]: startDate,
        [AggregateAPIParams.endDate]: endDate,
      }
    : {
        [SingleDayAPIParams.fromStop]: fromStopIds,
        [SingleDayAPIParams.toStop]: toStopIds,
        [SingleDayAPIParams.stop]: fromStopIds,
        [SingleDayAPIParams.date]: startDate,
      };

  const { traveltimes } = useCustomQueries(
    parameters,
    // @ts-expect-error The overloading doesn't seem to handle this const
    aggregate,
    startDate !== undefined && fromStopIds !== null && toStopIds !== null
  );

  const { traveltimes: traveltimesReversed } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: toStopIds,
      [SingleDayAPIParams.toStop]: fromStopIds,
      [SingleDayAPIParams.stop]: toStopIds,
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    startDate !== undefined && fromStopIdsNorth !== null && toStopIdsNorth !== null
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
        {aggregate ? (
          <TravelTimesAggregateChart
            traveltimes={traveltimes}
            fromStation={fromStation}
            toStation={toStation}
          />
        ) : (
          <TravelTimesSingleChart
            traveltimes={traveltimes}
            fromStation={fromStation}
            toStation={toStation}
          />
        )}
      </div>
      {!aggregate && (
        <>
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
      )}
    </>
  );
}
