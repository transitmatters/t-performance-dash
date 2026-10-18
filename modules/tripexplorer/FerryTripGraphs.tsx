import React from 'react';
import { useTripExplorerQueries } from '../../common/api/datadashboard';
import type { Station } from '../../common/types/stations';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import { getLocationDetails } from '../../common/utils/stations';
import type { Line } from '../../common/types/lines';
import { TravelTimesAggregateWrapper } from '../traveltimes/TravelTimesAggregateWrapper';
import { TravelTimesSingleWrapper } from '../traveltimes/TravelTimesSingleWrapper';
import { HeadwaysAggregateWrapper } from '../headways/HeadwaysAggregateWrapper';
import { HeadwaysSingleWrapper } from '../headways/HeadwaysSingleWrapper';
import { HeadwaysHistogramWrapper } from '../headways/charts/HeadwaysHistogramWrapper';

interface FerryTripGraphsProps {
  fromStation: Station;
  toStation: Station;
  parameters: SingleDayAPIOptions | AggregateAPIOptions; // TODO
  aggregate: boolean;
  enabled: boolean;
  line: Line | undefined;
}

export const FerryTripGraphs: React.FC<FerryTripGraphsProps> = ({
  fromStation,
  toStation,
  parameters,
  aggregate,
  enabled,
  line,
}) => {
  const [peakTime, setPeakTime] = React.useState<'weekday' | 'weekend'>('weekday');
  const [travelTimeDisplay, setTravelTimeDisplay] = React.useState<'speeds' | 'traveltimes'>(
    'traveltimes'
  );

  const { traveltimes, headways } = useTripExplorerQueries(
    'ferry',
    parameters,
    // @ts-expect-error The overloading doesn't seem to handle this const
    aggregate,
    enabled
  );
  const location = getLocationDetails(fromStation, toStation);

  return (
    <>
      {aggregate ? (
        <>
          <WidgetDiv>
            <>
              <WidgetTitle
                title="Travel times"
                subtitle="Time between stops"
                location={location}
                line={line}
                both
              />
              <TravelTimesAggregateWrapper
                query={traveltimes}
                fromStation={fromStation}
                toStation={toStation}
              />
            </>
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between ferries"
              location={location}
              line={line}
            />

            <HeadwaysAggregateWrapper
              query={headways}
              fromStation={fromStation}
              toStation={toStation}
            />
          </WidgetDiv>
          <WidgetDiv className="flex flex-col justify-center">
            <WidgetTitle title="Travel times by hour" location={location} line={line} both />
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
                line={line}
                pressFunction={setPeakTime}
                options={[
                  ['weekday', 'Weekday'],
                  ['weekend', 'Weekend/holiday'],
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
            <WidgetTitle
              title="Travel times"
              subtitle="Time between stops"
              location={location}
              line={line}
              both
            />
            <TravelTimesSingleWrapper
              query={traveltimes}
              fromStation={fromStation}
              toStation={toStation}
            />
            <div className={'flex w-full justify-center pt-2'}></div>
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between ferries"
              location={location}
              line={line}
            />
            <HeadwaysSingleWrapper
              query={headways}
              toStation={toStation}
              fromStation={fromStation}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headway distribution"
              subtitle="Time between ferries"
              location={location}
              line={line}
            />
            <HeadwaysHistogramWrapper
              query={headways}
              toStation={toStation}
              fromStation={fromStation}
            />
          </WidgetDiv>
        </>
      )}
    </>
  );
};
