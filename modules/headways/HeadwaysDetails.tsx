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
import { averageHeadway, longestHeadway } from '../../common/utils/headways';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { StationSelectorWidget } from '../../common/components/widgets/StationSelectorWidget';
import { HeadwaysSingleChart } from './charts/HeadwaysSingleChart';
import { HeadwaysHistogram } from './charts/HeadwaysHistogram';

export default function HeadwaysDetails() {
  const {
    lineShort,
    query: { startDate, busRoute },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busRoute);

  const [toStation, setToStation] = useState(stations?.[stations.length - 3]);
  const [fromStation, setFromStation] = useState(stations?.[3]);

  const { fromStopIds } = stopIdsForStations(fromStation, toStation);
  const headways = useQuery([fromStopIds, startDate], () =>
    fetchSingleDayData(QueryNameKeys.headways, { date: startDate, stop: fromStopIds })
  );

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
            new TimeWidgetValue(headways.data ? averageHeadway(headways.data) : undefined, 1)
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
        <BasicDataWidgetItem
          title="Longest Headway"
          widgetValue={
            new TimeWidgetValue(headways.data ? longestHeadway(headways.data) : undefined, 1)
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <HeadwaysSingleChart headways={headways} fromStation={fromStation} toStation={toStation} />
      </div>
      <div className="flex w-full flex-row items-center justify-between text-lg">
        <h3>Return Trip</h3>
      </div>

      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <HeadwaysHistogram headways={headways} fromStation={toStation} toStation={fromStation} />
      </div>
    </>
  );
}
