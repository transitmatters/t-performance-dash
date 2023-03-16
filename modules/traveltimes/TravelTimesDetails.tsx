'use client';

import React from 'react';
import dayjs from 'dayjs';
import { fetchAggregateData, fetchSingleDayData } from '../../common/api/datadashboard';
import { AggregateAPIOptions, QueryNameKeys, SingleDayAPIOptions } from '../../common/types/api';
import { AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageTravelTime } from '../../common/utils/traveltimes';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { TravelTimesSingleChart } from './charts/TravelTimesSingleChart';
import { TravelTimesAggregateChart } from './charts/TravelTimesAggregateChart';
import { useQuery } from '@tanstack/react-query';

export default function TravelTimesDetails() {
  const {
    linePath,
    lineShort,
    query: { startDate, endDate, busRoute },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busRoute);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const aggregate = startDate !== undefined && endDate !== undefined;
  const enabled = fromStopIds !== null && toStopIds !== null && startDate !== null;
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

  const travelTimesAggregate = useQuery({
    queryKey: [QueryNameKeys.traveltimes, aggregate, fromStopIds, toStopIds, startDate, endDate],
    enabled: aggregate && enabled,
    queryFn: () => fetchAggregateData(QueryNameKeys.traveltimes, parameters),
  });
  const travelTimesSingle = useQuery({
    queryKey: [QueryNameKeys.traveltimes, aggregate, fromStopIds, toStopIds, startDate, endDate],
    enabled: !aggregate && enabled,
    queryFn: () => fetchSingleDayData(QueryNameKeys.traveltimes, parameters),
  });

  const traveltimes = aggregate ? travelTimesAggregate : travelTimesSingle;
  const travelTimeValues = aggregate
    ? travelTimesAggregate?.data?.by_date?.map((tt) => tt.mean)
    : travelTimesSingle?.data?.map((tt) => tt.travel_time_sec);

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
              travelTimeValues ? averageTravelTime(travelTimeValues) : undefined,
              1
            )
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        {aggregate ? (
          <TravelTimesAggregateChart
            traveltimes={travelTimesAggregate}
            fromStation={fromStation}
            toStation={toStation}
          />
        ) : (
          <TravelTimesSingleChart
            traveltimes={travelTimesSingle}
            fromStation={fromStation}
            toStation={toStation}
          />
        )}
      </div>
    </>
  );
}
