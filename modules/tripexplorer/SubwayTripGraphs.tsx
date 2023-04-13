import React from 'react';
import { useTripExplorerQueries } from '../../common/api/datadashboard';
import type { Station } from '../../common/types/stations';
import { HeadwaysAggregateChart } from '../headways/charts/HeadwaysAggregateChart';
import { HeadwaysSingleChart } from '../headways/charts/HeadwaysSingleChart';
import { TravelTimesAggregateChart } from '../traveltimes/charts/TravelTimesAggregateChart';
import { TravelTimesSingleChart } from '../traveltimes/charts/TravelTimesSingleChart';
import { DwellsAggregateChart } from '../dwells/charts/DwellsAggregateChart';
import { DwellsSingleChart } from '../dwells/charts/DwellsSingleChart';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';

interface SubwayTripGraphsProps {
  fromStation: Station;
  toStation: Station;
  parameters: SingleDayAPIOptions | AggregateAPIOptions; // TODO
  aggregate: boolean;
  enabled: boolean;
}

export const SubwayTripGraphs: React.FC<SubwayTripGraphsProps> = ({
  fromStation,
  toStation,
  parameters,
  aggregate,
  enabled,
}) => {
  const { traveltimes, headways, dwells } = useTripExplorerQueries(
    'subway',
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
