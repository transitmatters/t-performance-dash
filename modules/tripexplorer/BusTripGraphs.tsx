import {
  useMultiDayTripMetrics,
  useSingleDayTripMetrics,
} from '../../common/api/hooks/tripExplorer';
import { newestChunkSubtitle } from '../../common/utils/dateChunks';
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
import {
  ByVehicleTitle,
  TravelTimesByVehicleWrapper,
} from '../traveltimes/TravelTimesByVehicleWrapper';
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

export const BusTripGraphs = ({
  fromStation,
  toStation,
  parameters,
  aggregate,
  enabled,
  line,
}: BusTripGraphsProps) => {
  // Only the view on screen fetches; the other hook stays disabled.
  const single = useSingleDayTripMetrics({
    routeType: 'bus',
    params: parameters,
    enabled: enabled && !aggregate,
  });
  const multi = useMultiDayTripMetrics({
    routeType: 'bus',
    params: parameters,
    enabled: enabled && aggregate,
  });
  const location = getLocationDetails(fromStation, toStation);
  const { query } = useDelimitatedRoute();
  const busRouteLabel = query.busRoute ? `Route ${query.busRoute}` : undefined;
  const { value: peakTime, control: peakTimeControl } = useChartToggle(
    'weekday' as const,
    PEAK_TIME_OPTIONS,
    { paramKey: 'peak' }
  );
  const { value: travelTimesDayFilter, control: travelTimesDayFilterControl } = useChartToggle(
    'all' as const,
    DAY_FILTER_OPTIONS,
    { paramKey: 'ttDays' }
  );
  const { value: headwaysDayFilter, control: headwaysDayFilterControl } = useChartToggle(
    'all' as const,
    DAY_FILTER_OPTIONS,
    { paramKey: 'hwDays' }
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
              query={multi.traveltimes}
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
              query={multi.headways}
              toStation={toStation}
              fromStation={fromStation}
              dayFilter={headwaysDayFilter}
            />
          </WidgetDiv>
          <WidgetDiv className="flex flex-col justify-center">
            <WidgetTitle
              title="Travel times by hour"
              subtitle={newestChunkSubtitle(multi.traveltimes.chunks)}
              location={location}
              line={line}
              both
              action={peakTimeControl}
            />
            <AggregateChartWrapper
              query={multi.traveltimes}
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
          {single.traveltimes.data && (
            <DelayInsight
              data={single.traveltimes.data}
              metricField={MetricFieldKeys.travelTimeSec}
              benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
              date={query.date}
              subject={busRouteLabel}
              line={line}
            />
          )}
          <WidgetDiv>
            <WidgetTitle title="Travel times" location={location} line={line} both />
            <TravelTimesSingleWrapper
              query={single.traveltimes}
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
              query={single.headways}
              toStation={toStation}
              fromStation={fromStation}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title={<ByVehicleTitle vehicleNoun="Bus" />}
              subtitle="Median travel time of each bus"
              location={location}
              line={line}
              both
            />
            <TravelTimesByVehicleWrapper
              query={single.traveltimes}
              toStation={toStation}
              fromStation={fromStation}
              vehicleNoun="Bus"
            />
          </WidgetDiv>
        </>
      )}
    </>
  );
};
