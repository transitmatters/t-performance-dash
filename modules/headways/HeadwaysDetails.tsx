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
import { averageHeadway, longestHeadway } from '../../common/utils/headways';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { StationSelectorWidget } from '../../common/components/widgets/StationSelectorWidget';
import { HeadwaysSingleChart } from './charts/HeadwaysSingleChart';
import { HeadwaysHistogram } from './charts/HeadwaysHistogram';
import { HeadwaysAggregateChart } from './charts/HeadwaysAggregateChart';

export default function HeadwaysDetails() {
  const {
    lineShort,
    query: { startDate, endDate, busRoute },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busRoute);

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

  const headways = useQuery({
    queryKey: [QueryNameKeys.headways, aggregate, fromStopIds, startDate],
    enabled: !aggregate && enabled,
    queryFn: () => fetchSingleDayData(QueryNameKeys.headways, parameters),
  });
  const headwaysAggregate = useQuery({
    queryKey: [QueryNameKeys.headways, aggregate, fromStopIds, startDate, endDate],
    enabled: aggregate && enabled,
    queryFn: () => fetchAggregateData(QueryNameKeys.headways, parameters),
  });

  const headwaysData = aggregate ? headwaysAggregate?.data?.by_date : headways?.data;

  if (headways.isError) {
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
          title="Average Headway"
          widgetValue={
            new TimeWidgetValue(headwaysData ? averageHeadway(headwaysData) : undefined, 1)
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
        <BasicDataWidgetItem
          title="Longest Headway"
          widgetValue={
            new TimeWidgetValue(headwaysData ? longestHeadway(headwaysData) : undefined, 1)
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        {aggregate ? (
          <HeadwaysAggregateChart
            headways={headwaysAggregate}
            fromStation={fromStation}
            toStation={toStation}
          />
        ) : (
          <HeadwaysSingleChart
            headways={headways}
            fromStation={fromStation}
            toStation={toStation}
          />
        )}
      </div>
      <div className="flex w-full flex-row items-center justify-between text-lg">
        <h3>Headway Variance</h3>
      </div>

      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <HeadwaysHistogram headways={headways} fromStation={toStation} toStation={fromStation} />
      </div>
    </>
  );
}
