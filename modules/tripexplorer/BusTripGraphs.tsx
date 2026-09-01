import React from 'react';
import { useTripExplorerQueries } from '../../common/api/datadashboard';
import type { Station } from '../../common/types/stations';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import {
  DAY_FILTER_OPTIONS,
  PEAK_TIME_OPTIONS,
  useChartToggle,
} from '../../common/hooks/useChartToggle';
import { getLocationDetails } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import type { Line } from '../../common/types/lines';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';
import { TravelTimesAggregateWrapper } from '../traveltimes/TravelTimesAggregateWrapper';
import { TravelTimesSingleWrapper } from '../traveltimes/TravelTimesSingleWrapper';
import { HeadwaysSingleWrapper } from '../headways/HeadwaysSingleWrapper';
import { HeadwaysAggregateWrapper } from '../headways/HeadwaysAggregateWrapper';
import { DelayInsight } from '../../common/components/notices/DelayInsight';
import { BenchmarkFieldKeys, MetricFieldKeys } from '../../common/types/charts';

interface BusTripGraphsProps {
  fromStation: Station;
  toStation: Station;
  parameters: AggregateAPIOptions | SingleDayAPIOptions; // TODO
  aggregate: boolean;
  enabled: boolean;
  line: Line | undefined;
}

export const BusTripGraphs: React.FC<BusTripGraphsProps> = ({
  fromStation,
  toStation,
  parameters,
  aggregate,
  enabled,
  line,
}) => {
  const { traveltimes, headways } = useTripExplorerQueries(
    'bus',
    parameters,
    // @ts-expect-error The overloading doesn't seem to handle this const
    aggregate,
    enabled
  );
  const location = getLocationDetails(fromStation, toStation);
  const { query } = useDelimitatedRoute();
  const busRouteLabel = query.busRoute ? `Route ${query.busRoute}` : undefined;
  const { value: peakTime, control: peakTimeControl } = useChartToggle(
    'weekday' as const,
    PEAK_TIME_OPTIONS
  );
  const { value: travelTimesDayFilter, control: travelTimesDayFilterControl } = useChartToggle(
    'all' as const,
    DAY_FILTER_OPTIONS
  );
  const { value: headwaysDayFilter, control: headwaysDayFilterControl } = useChartToggle(
    'all' as const,
    DAY_FILTER_OPTIONS
  );

  return (
    <>
      {aggregate ? (
        <>
          <WidgetDiv>
            <WidgetTitle
              title="Travel times"
              location={location}
              line={line}
              both
              action={travelTimesDayFilterControl}
            />
            <TravelTimesAggregateWrapper
              query={traveltimes}
              fromStation={fromStation}
              toStation={toStation}
              dayFilter={travelTimesDayFilter}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between buses"
              location={location}
              line={line}
              action={headwaysDayFilterControl}
            />
            <HeadwaysAggregateWrapper
              query={headways}
              toStation={toStation}
              fromStation={fromStation}
              dayFilter={headwaysDayFilter}
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
          {traveltimes.data && (
            <DelayInsight
              data={traveltimes.data}
              metricField={MetricFieldKeys.travelTimeSec}
              benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
              subject={busRouteLabel}
              line={line}
            />
          )}
          <WidgetDiv>
            <WidgetTitle title="Travel times" location={location} line={line} both />
            <TravelTimesSingleWrapper
              query={traveltimes}
              toStation={toStation}
              fromStation={fromStation}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between buses"
              location={location}
              line={line}
            />
            <HeadwaysSingleWrapper
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
