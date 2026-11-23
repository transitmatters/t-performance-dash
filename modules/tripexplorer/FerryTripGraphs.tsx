import { useTripPage } from '../../common/hooks/usePageParams';
import { newestChunkSubtitle } from '../../common/utils/dateChunks';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import {
  DAY_FILTER_OPTIONS,
  PEAK_TIME_OPTIONS,
  useChartToggle,
} from '../../common/hooks/useChartToggle';
import { getLocationDetails } from '../../common/utils/stations';
import { TravelTimesAggregateWrapper } from '../traveltimes/TravelTimesAggregateWrapper';
import { TravelTimesSingleWrapper } from '../traveltimes/TravelTimesSingleWrapper';
import { HeadwaysAggregateWrapper } from '../headways/HeadwaysAggregateWrapper';
import { HeadwaysSingleWrapper } from '../headways/HeadwaysSingleWrapper';
import { HeadwaysHistogramWrapper } from '../headways/charts/HeadwaysHistogramWrapper';
import { useTripMetrics } from './useTripMetrics';

export const FerryTripGraphs = () => {
  const { line, fromStation, toStation, dates } = useTripPage();
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

  const { single, multi } = useTripMetrics('ferry');

  const location = getLocationDetails(fromStation, toStation);

  return (
    <>
      {dates.kind === 'range' ? (
        <>
          <WidgetDiv>
            <>
              <WidgetTitle
                title="Travel times"
                subtitle="Time between stops"
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
            </>
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between ferries"
              location={location}
              line={line}
              action={headwaysDayFilterControl}
            />

            <HeadwaysAggregateWrapper
              query={multi.headways}
              fromStation={fromStation}
              toStation={toStation}
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
              startDate={dates.startDate}
              endDate={dates.endDate}
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
          <WidgetDiv>
            <WidgetTitle
              title="Travel times"
              subtitle="Time between stops"
              location={location}
              line={line}
              both
            />
            <TravelTimesSingleWrapper
              query={single.traveltimes}
              fromStation={fromStation}
              toStation={toStation}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between ferries"
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
              title="Headway distribution"
              subtitle="Time between ferries"
              location={location}
              line={line}
            />
            <HeadwaysHistogramWrapper
              query={single.headways}
              toStation={toStation}
              fromStation={fromStation}
            />
          </WidgetDiv>
        </>
      )}
    </>
  );
};
