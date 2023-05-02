import React from 'react';
import { useTripExplorerQueries } from '../../common/api/datadashboard';
import type { Station } from '../../common/types/stations';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { SingleChartWrapper } from '../../common/components/charts/SingleChartWrapper';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';

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
            <AggregateChartWrapper
              query={traveltimes}
              toStation={toStation}
              fromStation={fromStation}
              type={'traveltimes'}
            />
          </WidgetDiv>
          <WidgetDiv>
            <AggregateChartWrapper
              query={headways}
              toStation={toStation}
              fromStation={fromStation}
              type={'headways'}
            />
          </WidgetDiv>
          <WidgetDiv>
            <AggregateChartWrapper
              query={dwells}
              toStation={toStation}
              fromStation={fromStation}
              type={'dwells'}
            />
          </WidgetDiv>
        </>
      ) : (
        <>
          <WidgetDiv>
            <SingleChartWrapper
              query={traveltimes}
              toStation={toStation}
              fromStation={fromStation}
              type={'traveltimes'}
            />
          </WidgetDiv>

          <WidgetDiv>
            <SingleChartWrapper
              query={headways}
              toStation={toStation}
              fromStation={fromStation}
              type={'headways'}
            />
          </WidgetDiv>
          <WidgetDiv>
            <SingleChartWrapper
              query={dwells}
              toStation={toStation}
              fromStation={fromStation}
              type={'dwells'}
            />
          </WidgetDiv>
        </>
      )}
    </div>
  );
};
