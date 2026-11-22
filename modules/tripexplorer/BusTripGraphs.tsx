import { useTripPage } from '../../common/hooks/usePageParams';
import { newestChunkSubtitle } from '../../common/utils/dateChunks';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import {
  DAY_FILTER_OPTIONS,
  PEAK_TIME_OPTIONS,
  useChartToggle,
} from '../../common/hooks/useChartToggle';
import { getLocationDetails } from '../../common/utils/stations';
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
import { useTripMetrics } from './useTripMetrics';

export const BusTripGraphs = () => {
  const { line, fromStation, toStation, busRoute, dates } = useTripPage();
  const { aggregate, single, multi } = useTripMetrics('bus');
  const location = getLocationDetails(fromStation, toStation);
  const busRouteLabel = busRoute ? `Route ${busRoute}` : undefined;
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
              date={dates.kind === 'single' ? dates.date : undefined}
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
