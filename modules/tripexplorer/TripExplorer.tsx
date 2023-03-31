import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { fetchSingleDayData, useCustomQueries } from '../../common/api/datadashboard';
import { AggregateAPIOptions, QueryNameKeys, SingleDayAPIOptions } from '../../common/types/api';
import { AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import { useDelimitatedRoute } from '../../common/utils/router';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { DwellsAggregateChart } from '../dwells/charts/DwellsAggregateChart';
import { HeadwaysAggregateChart } from '../headways/charts/HeadwaysAggregateChart';
import { HeadwaysSingleChart } from '../headways/charts/HeadwaysSingleChart';

export const TripExplorer = () => {
  const {
    lineShort,
    query: { startDate, endDate, busRoute },
  } = useDelimitatedRoute();

  const aggregate = startDate && endDate;

  const stations = optionsStation(lineShort, busRoute);

  const [toStation, setToStation] = useState(stations?.[stations.length - 3]);
  const [fromStation, setFromStation] = useState(stations?.[3]);

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const enabled = fromStopIds && startDate;

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

  const { traveltimes, headways, dwells } = useCustomQueries(
    parameters,
    // @ts-expect-error The overloading doesn't seem to handle this const
    aggregate,
    Boolean(startDate && fromStopIds && toStopIds)
  );

  return (
    <div className="flex flex-col gap-4">
      {aggregate ? (
        <>
          <HeadwaysAggregateChart headways={headways} fromStation={fromStation} />
          <DwellsAggregateChart dwells={dwells} fromStation={fromStation} />
        </>
      ) : (
        <>
          <HeadwaysSingleChart
            headways={headways}
            fromStation={fromStation}
            toStation={toStation}
          />
          <DwellsSingleChart dwells={dwells} fromStation={fromStation} />
        </>
      )}
    </div>
  );
};
