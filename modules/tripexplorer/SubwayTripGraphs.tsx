import React from 'react';
import { useTripExplorerQueries } from '../../common/api/datadashboard';
import type { Station } from '../../common/types/stations';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { SingleChartWrapper } from '../../common/components/charts/SingleChartWrapper';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { getLocationDetails } from '../../common/utils/stations';
import type { Line } from '../../common/types/lines';
import { TravelTimesAggregateWrapper } from '../traveltimes/TravelTimesAggregateWrapper';

interface SubwayTripGraphsProps {
  fromStation: Station;
  toStation: Station;
  parameters: SingleDayAPIOptions | AggregateAPIOptions; // TODO
  aggregate: boolean;
  enabled: boolean;
  line: Line | undefined;
}

export const SubwayTripGraphs: React.FC<SubwayTripGraphsProps> = ({
  fromStation,
  toStation,
  parameters,
  aggregate,
  enabled,
  line,
}) => {
  const [peakTime, setPeakTime] = React.useState<'weekday' | 'weekend'>('weekday');
  const { traveltimes, headways, dwells } = useTripExplorerQueries(
    'subway',
    parameters,
    // @ts-expect-error The overloading doesn't seem to handle this const
    aggregate,
    enabled
  );
  const location = getLocationDetails(fromStation, toStation);

  return (
    <div className="flex flex-col gap-4">
      {aggregate ? (
        <>
          <WidgetDiv>
            <WidgetTitle title="Travel Times" location={location} line={line} both />
            <TravelTimesAggregateWrapper
              query={traveltimes}
              traveltimes={traveltimes.data?.by_date}
              fromStation={fromStation}
              toStation={toStation}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between trains"
              location={location}
              line={line}
            />

            <AggregateChartWrapper
              query={headways}
              toStation={toStation}
              fromStation={fromStation}
              type={'headways'}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Dwells"
              subtitle="Time spent at station"
              location={location}
              line={line}
            />

            <AggregateChartWrapper
              query={dwells}
              toStation={toStation}
              fromStation={fromStation}
              type={'dwells'}
            />
          </WidgetDiv>
          <WidgetDiv className="flex flex-col justify-center">
            <WidgetTitle title="Travel Times By Hour" location={location} line={line} both />
            <AggregateChartWrapper
              query={traveltimes}
              toStation={toStation}
              fromStation={fromStation}
              type={'traveltimes'}
              timeUnit={'by_time'}
              peakTime={peakTime === 'weekday' ? true : false}
            />
            <div className={'flex w-full justify-center pt-2'}>
              <ButtonGroup
                pressFunction={setPeakTime}
                options={[
                  ['weekday', 'Weekday'],
                  ['weekend', 'Weekend/Holiday'],
                ]}
                additionalDivClass="md:w-auto"
                additionalButtonClass="md:w-fit"
              />
            </div>
          </WidgetDiv>
        </>
      ) : (
        <>
          <WidgetDiv>
            <WidgetTitle title="Travel Times" location={location} line={line} both />
            <SingleChartWrapper
              query={traveltimes}
              toStation={toStation}
              fromStation={fromStation}
              type={'traveltimes'}
            />
          </WidgetDiv>

          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between trains"
              location={location}
              line={line}
            />
            <SingleChartWrapper
              query={headways}
              toStation={toStation}
              fromStation={fromStation}
              type={'headways'}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Dwells"
              subtitle="Time spent at station"
              location={location}
              line={line}
            />
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
