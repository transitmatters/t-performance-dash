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
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';

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
          <WidgetDiv>
            <TravelTimesAggregateChart
              traveltimes={traveltimes}
              fromStation={fromStation}
              toStation={toStation}
            />
          </WidgetDiv>
          <WidgetDiv>
            <HeadwaysAggregateChart
              headways={headways}
              fromStation={fromStation}
              toStation={toStation}
            />
          </WidgetDiv>
          <WidgetDiv>
            <DwellsAggregateChart dwells={dwells} fromStation={fromStation} toStation={toStation} />
          </WidgetDiv>
        </>
      ) : (
        <>
          <WidgetDiv>
            <TravelTimesSingleChart
              traveltimes={traveltimes}
              fromStation={fromStation}
              toStation={toStation}
            />
          </WidgetDiv>

          <WidgetDiv>
            <HeadwaysSingleChart
              headways={headways}
              fromStation={fromStation}
              toStation={toStation}
            />
          </WidgetDiv>
          <WidgetDiv>
            <DwellsSingleChart dwells={dwells} fromStation={fromStation} toStation={toStation} />
          </WidgetDiv>
        </>
      )}
    </div>
  );
};
