import {
  useMultiDayTripMetrics,
  useSingleDayTripMetrics,
} from '../../common/api/hooks/tripExplorer';
import { newestChunkSubtitle } from '../../common/utils/dateChunks';
import type { Station } from '../../common/types/stations';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { QueryNameKeys } from '../../common/types/api';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';
import {
  DAY_FILTER_OPTIONS,
  PEAK_TIME_OPTIONS,
  useChartToggle,
} from '../../common/hooks/useChartToggle';
import { getLocationDetails } from '../../common/utils/stations';
import type { Line } from '../../common/types/lines';
import { TravelTimesAggregateWrapper } from '../traveltimes/TravelTimesAggregateWrapper';
import { HeadwaysAggregateWrapper } from '../headways/HeadwaysAggregateWrapper';
import { TravelTimesSingleWrapper } from '../traveltimes/TravelTimesSingleWrapper';
import { HeadwaysSingleWrapper } from '../headways/HeadwaysSingleWrapper';
import { DwellsAggregateWrapper } from '../dwells/DwellsAggregateWrapper';
import { DwellsSingleWrapper } from '../dwells/DwellsSingleWrapper';
import { WidgetTitle } from '../../common/components/widgets';
import { RegionalRailPreview } from './regionalRail/RegionalRailPreview';

interface CommuterRailTripGraphsProps {
  fromStation: Station;
  toStation: Station;
  parameters: SingleDayAPIOptions | AggregateAPIOptions; // TODO
  aggregate: boolean;
  enabled: boolean;
  line: Line | undefined;
}

export const CommuterRailTripGraphs = ({
  fromStation,
  toStation,
  parameters,
  aggregate,
  enabled,
  line,
}: CommuterRailTripGraphsProps) => {
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
  const { value: dwellsDayFilter, control: dwellsDayFilterControl } = useChartToggle(
    'all' as const,
    DAY_FILTER_OPTIONS,
    { paramKey: 'dwDays' }
  );

  // Only the view on screen fetches; the other hook stays disabled.
  const single = useSingleDayTripMetrics({
    routeType: 'cr',
    params: parameters,
    enabled: enabled && !aggregate,
    skip: fromStation?.terminus ? [QueryNameKeys.dwells] : [],
  });

  const multi = useMultiDayTripMetrics({
    routeType: 'cr',
    params: parameters,
    enabled: enabled && aggregate,
    skip: fromStation?.terminus ? [QueryNameKeys.dwells] : [],
  });
  
  const location = getLocationDetails(fromStation, toStation);

  return (
    <>
      {aggregate ? (
        <>
          <WidgetDiv>
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
              query={multi.headways}
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
              query={multi.dwells}
              fromStation={fromStation}
              toStation={toStation}
              dayFilter={dwellsDayFilter}
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
              peakTime={peakTime === 'weekday'}
            />
          </WidgetDiv>
          <RegionalRailPreview fromStation={fromStation} toStation={toStation} />
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
              toStation={toStation}
              fromStation={fromStation}
            />
          </WidgetDiv>

          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between trains"
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
              title="Dwells"
              subtitle="Time spent at station"
              location={location}
              line={line}
            />
            <DwellsSingleWrapper
              query={single.dwells}
              toStation={toStation}
              fromStation={fromStation}
            />
          </WidgetDiv>
          <RegionalRailPreview fromStation={fromStation} toStation={toStation} />
        </>
      )}
    </>
  );
};
