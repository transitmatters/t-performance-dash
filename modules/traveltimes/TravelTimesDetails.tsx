'use client';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { fetchAggregateData, fetchSingleDayData } from '../../common/api/datadashboard';
import { QueryNameKeys, AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import {
  lookup_station_by_id,
  optionsStation,
  stopIdsForStations,
} from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageTravelTime } from '../../common/utils/traveltimes';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { StationSelectorWidget } from '../../common/components/widgets/StationSelectorWidget';
import { ErrorNotice } from '../../common/components/notices/ErrorNotice';
import { TravelTimesSingleChart } from './charts/TravelTimesSingleChart';
import { TravelTimesAggregateChart } from './charts/TravelTimesAggregateChart';

export default function TravelTimesDetails() {
  const {
    linePath,
    lineShort,
    query: { startDate, endDate, busRoute, to, from },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busRoute);

  const [toStation, setToStation] = useState(
    to ? lookup_station_by_id(lineShort, to) : stations?.[stations.length - 3]
  );
  const [fromStation, setFromStation] = useState(
    from ? lookup_station_by_id(lineShort, from) : stations?.[3]
  );

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
    return <ErrorNotice />;
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
