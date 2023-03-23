'use client';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { fetchAggregateData, fetchSingleDayData } from '../../common/api/datadashboard';
import { QueryNameKeys, AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageTravelTime } from '../../common/utils/traveltimes';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { StationSelector } from '../../common/components/inputs/StationSelector';
import { TravelTimesSingleChart } from './charts/TravelTimesSingleChart';
import { TravelTimesAggregateChart } from './charts/TravelTimesAggregateChart';

export default function TravelTimesDetails() {
  const {
    linePath,
    lineShort,
    query: { startDate, endDate, busRoute },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busRoute);

  const [toStation, setToStation] = useState(stations?.[stations.length - 3]);
  const [fromStation, setFromStation] = useState(stations?.[3]);

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  React.useEffect(() => {
    setToStation(stations?.[stations.length - 3]);
    setFromStation(stations?.[3]);
  }, [stations]);

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
      {/* TODO Move station Selector pair */}
      {fromStation && toStation ? (
        <div
          className={classNames(
            'w-1/2 rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox sm:w-auto sm:p-4'
          )}
        >
          <StationSelector
            type={'from'}
            fromStation={fromStation}
            toStation={toStation}
            setStation={setFromStation}
          />
          <StationSelector
            type={'to'}
            fromStation={fromStation}
            toStation={toStation}
            setStation={setToStation}
          />
        </div>
      ) : null}
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
