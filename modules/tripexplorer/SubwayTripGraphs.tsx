import React from 'react';
import { useTripExplorerQueries } from '../../common/api/datadashboard';
import type { Station } from '../../common/types/stations';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import {
  DAY_FILTER_OPTIONS,
  PEAK_TIME_OPTIONS,
  useChartToggle,
} from '../../common/hooks/useChartToggle';
import { getLocationDetails } from '../../common/utils/stations';
import type { Line } from '../../common/types/lines';
import { TravelTimesAggregateWrapper } from '../traveltimes/TravelTimesAggregateWrapper';
import { HeadwaysAggregateWrapper } from '../headways/HeadwaysAggregateWrapper';
import { DwellsAggregateWrapper } from '../dwells/DwellsAggregateWrapper';
import { HeadwaysSingleWrapper } from '../headways/HeadwaysSingleWrapper';
import { DwellsSingleWrapper } from '../dwells/DwellsSingleWrapper';
import { HeadwaysHistogramWrapper } from '../headways/charts/HeadwaysHistogramWrapper';
import { SpeedBetweenStationsSingleWrapper } from '../speed/SpeedBetweenStationsGraphWrapper';
import { SpeedBetweenStationsAggregateWrapper } from '../speed/SpeedBetweenStationsAggregateWrapper';
import { TravelTimesSingleWrapper } from '../traveltimes/TravelTimesSingleWrapper';

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
  const { value: peakTime, control: peakTimeControl } = useChartToggle(
    'weekday' as const,
    PEAK_TIME_OPTIONS
  );
  const { value: travelTimeDisplay, control: travelTimeControl } = useChartToggle(
    'traveltimes' as const,
    [
      ['traveltimes', 'Travel times'],
      ['speeds', 'Speeds'],
    ]
  );
  const { value: travelTimesDayFilter, control: travelTimesDayFilterControl } = useChartToggle(
    'all' as const,
    DAY_FILTER_OPTIONS
  );
  const { value: headwaysDayFilter, control: headwaysDayFilterControl } = useChartToggle(
    'all' as const,
    DAY_FILTER_OPTIONS
  );
  const { value: dwellsDayFilter, control: dwellsDayFilterControl } = useChartToggle(
    'all' as const,
    DAY_FILTER_OPTIONS
  );

  const { traveltimes, headways, dwells } = useTripExplorerQueries(
    'subway',
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
            {travelTimeDisplay === 'speeds' ? (
              <>
                <WidgetTitle
                  title="Speeds"
                  subtitle="Average speed between stops"
                  location={location}
                  line={line}
                  both
                  action={travelTimeControl}
                />
                <SpeedBetweenStationsAggregateWrapper
                  query={traveltimes}
                  fromStation={fromStation}
                  toStation={toStation}
                />
              </>
            ) : (
              <>
                <WidgetTitle
                  title="Travel times"
                  subtitle="Time between stops"
                  location={location}
                  line={line}
                  both
                  action={
                    <div className="flex flex-row items-center gap-x-2">
                      {travelTimeControl}
                      {travelTimesDayFilterControl}
                    </div>
                  }
                />
                <TravelTimesAggregateWrapper
                  query={traveltimes}
                  fromStation={fromStation}
                  toStation={toStation}
                  dayFilter={travelTimesDayFilter}
                />
              </>
            )}
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between trains"
              location={location}
              line={line}
              action={headwaysDayFilterControl}
            />

            <HeadwaysAggregateWrapper
              query={headways}
              fromStation={fromStation}
              toStation={toStation}
              dayFilter={headwaysDayFilter}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Dwells"
              subtitle="Time spent at station"
              location={location}
              line={line}
              action={dwellsDayFilterControl}
            />
            <DwellsAggregateWrapper
              query={dwells}
              fromStation={fromStation}
              toStation={toStation}
              dayFilter={dwellsDayFilter}
            />
          </WidgetDiv>
          <WidgetDiv className="flex flex-col justify-center">
            <WidgetTitle
              title="Travel times by hour"
              location={location}
              line={line}
              both
              action={peakTimeControl}
            />
            <AggregateChartWrapper
              query={traveltimes}
              toStation={toStation}
              fromStation={fromStation}
              type={'traveltimes'}
              timeUnit={'by_time'}
              peakTime={peakTime === 'weekday' ? true : false}
            />
          </WidgetDiv>
        </>
      ) : (
        <>
          <WidgetDiv>
            {travelTimeDisplay === 'speeds' ? (
              <>
                <WidgetTitle
                  title="Speeds"
                  subtitle="Average speed between stops"
                  location={location}
                  line={line}
                  both
                  action={travelTimeControl}
                />
                <SpeedBetweenStationsSingleWrapper
                  query={traveltimes}
                  fromStation={fromStation}
                  toStation={toStation}
                />
              </>
            ) : (
              <>
                <WidgetTitle
                  title="Travel times"
                  subtitle="Time between stops"
                  location={location}
                  line={line}
                  both
                  action={travelTimeControl}
                />
                <TravelTimesSingleWrapper
                  query={traveltimes}
                  fromStation={fromStation}
                  toStation={toStation}
                />
              </>
            )}
          </WidgetDiv>

          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between trains"
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
              title="Dwells"
              subtitle="Time spent at station"
              location={location}
              line={line}
            />
            <DwellsSingleWrapper query={dwells} toStation={toStation} fromStation={fromStation} />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headway distribution"
              subtitle="Time between trains"
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
