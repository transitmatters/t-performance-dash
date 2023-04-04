import React from 'react';
import { useCustomQueries } from '../../common/api/datadashboard';
import { AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import type { Station } from '../../common/types/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { stopIdsForStations } from '../../common/utils/stations';
import { DwellsAggregateChart } from '../dwells/charts/DwellsAggregateChart';
import { DwellsSingleChart } from '../dwells/charts/DwellsSingleChart';
import { HeadwaysAggregateChart } from '../headways/charts/HeadwaysAggregateChart';
import { HeadwaysSingleChart } from '../headways/charts/HeadwaysSingleChart';
import { TravelTimesAggregateChart } from '../traveltimes/charts/TravelTimesAggregateChart';
import { TravelTimesSingleChart } from '../traveltimes/charts/TravelTimesSingleChart';

interface TripGraphsProps {
  fromStation: Station;
  toStation: Station;
}

export const TripGraphs: React.FC<TripGraphsProps> = ({ fromStation, toStation }) => {
  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const aggregate = Boolean(startDate && endDate);
  const enabled = Boolean(startDate && fromStopIds && toStopIds);

  const parameters: SingleDayAPIOptions | AggregateAPIOptions = aggregate
    ? {
        [AggregateAPIParams.stop]: fromStopIds,
        [AggregateAPIParams.fromStop]: fromStopIds,
        [AggregateAPIParams.toStop]: toStopIds,
        [AggregateAPIParams.startDate]: startDate,
        [AggregateAPIParams.endDate]: endDate,
      }
    : {
        [SingleDayAPIParams.stop]: fromStopIds,
        [SingleDayAPIParams.fromStop]: fromStopIds,
        [SingleDayAPIParams.toStop]: toStopIds,
        [SingleDayAPIParams.date]: startDate,
      };

  const { traveltimes, headways, dwells } = useCustomQueries(
    parameters,
    // @ts-expect-error The overloading doesn't seem to handle this const
    aggregate,
    enabled
  );

  return (
    <div className="flex flex-col gap-4">
      {aggregate ? (
        <>
          <TravelTimesAggregateChart
            traveltimes={traveltimes}
            fromStation={fromStation}
            toStation={toStation}
          />
          <HeadwaysAggregateChart
            headways={headways}
            fromStation={fromStation}
            toStation={toStation}
          />
          <DwellsAggregateChart dwells={dwells} fromStation={fromStation} toStation={toStation} />
        </>
      ) : (
        <>
          <TravelTimesSingleChart
            traveltimes={traveltimes}
            fromStation={fromStation}
            toStation={toStation}
          />

          <HeadwaysSingleChart
            headways={headways}
            fromStation={fromStation}
            toStation={toStation}
          />
          <DwellsSingleChart dwells={dwells} fromStation={fromStation} toStation={toStation} />
        </>
      )}
    </div>
  );
};
