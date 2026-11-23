import dayjs from 'dayjs';
import { useSearch } from '@tanstack/react-router';
import { EmbedFrame } from '../../common/components/embed/EmbedFrame';
import { EmbedMessage } from '../../common/components/embed/EmbedMessage';
import { PRETTY_DATE_FORMAT } from '../../common/constants/dates';
import { DAY_FILTER_OPTIONS } from '../../common/hooks/useChartToggle';
import type { RouteType } from '../../common/types/api';
import type { DayFilter } from '../../common/types/charts';
import type { QueryParams, Tab } from '../../common/types/router';
import { useLinePage } from '../../common/hooks/usePageParams';
import { canonicalDateRange, canonicalSingleDate } from '../../common/utils/dateParams';
import { getLocationDetails, getParentStationForStopId } from '../../common/utils/stations';
import type { TripEmbed } from './embed';
import { MULTI_TRIP_DAY_PARAMS, getTripEmbedTitle, getTripPageUrl } from './embed';
import { MultiTripEmbedChart } from './MultiTripEmbedChart';
import { SingleTripEmbedChart } from './SingleTripEmbedChart';

const ROUTE_TYPES: Partial<Record<Tab, RouteType>> = {
  Subway: 'subway',
  Bus: 'bus',
  'Commuter Rail': 'cr',
  Ferry: 'ferry',
};

/** Charts of the trip between two stops, rather than of one stop. */
const BETWEEN_STOPS = ['traveltimes', 'speeds', 'traveltimes-by-hour'];

const formatDate = (date: string) => dayjs(date).format(PRETTY_DATE_FORMAT);

/** The chart's day filter; travel times by hour show weekdays unless told otherwise, as on the page. */
const getDays = (embed: TripEmbed, query: QueryParams): DayFilter => {
  const param = embed.page === 'multi' ? MULTI_TRIP_DAY_PARAMS[embed.chart] : undefined;
  const value = param ? query[param] : undefined;
  const fallback = embed.chart === 'traveltimes-by-hour' ? 'weekday' : 'all';
  return DAY_FILTER_OPTIONS.find(([option]) => option === value)?.[0] ?? fallback;
};

/** One trip chart on its own, for iframing into articles. */
export const TripChartEmbed = (embed: TripEmbed) => {
  const { line, linePath, tab, lineShort } = useLinePage();
  const query = useSearch({ strict: false });
  // Fills in missing or out-of-range dates without rewriting the URL, as the slow zone embed does.
  const shown =
    embed.page === 'single'
      ? {
          ...embed,
          ...canonicalSingleDate({
            section: 'singleTrips',
            tab,
            page: 'singleTrips',
            search: query,
          }),
        }
      : {
          ...embed,
          ...canonicalDateRange({ section: 'multiTrips', tab, page: 'multiTrips', search: query }),
        };
  const days = getDays(embed, query);

  const fromStation = query.from ? getParentStationForStopId(query.from, lineShort) : undefined;
  const toStation = query.to ? getParentStationForStopId(query.to, lineShort) : undefined;
  const location = getLocationDetails(fromStation, toStation);
  const where = BETWEEN_STOPS.includes(embed.chart)
    ? `${location.from} to ${location.to}`
    : `${location.from}, ${location.direction}`;
  const when =
    shown.page === 'single'
      ? formatDate(shown.date)
      : `${formatDate(shown.startDate)} – ${formatDate(shown.endDate)}`;
  const dayLabel = DAY_FILTER_OPTIONS.find(([option]) => option === days && option !== 'all')?.[1];

  const renderChart = () => {
    if (!fromStation || !toStation)
      return <EmbedMessage>This embed is missing its stops.</EmbedMessage>;
    const props = { routeType: ROUTE_TYPES[tab] ?? 'subway', fromStation, toStation } as const;
    return shown.page === 'single' ? (
      <SingleTripEmbedChart chart={shown.chart} date={shown.date} {...props} />
    ) : (
      <MultiTripEmbedChart
        chart={shown.chart}
        startDate={shown.startDate}
        endDate={shown.endDate}
        days={days}
        trendline={query.trend === '1'}
        {...props}
      />
    );
  };

  return (
    <EmbedFrame
      title={getTripEmbedTitle(embed, { line, query })}
      subtitle={[where, when, dayLabel].filter(Boolean).join(' · ')}
      href={getTripPageUrl(embed, { linePath, query: { ...query, ...shown } })}
    >
      {renderChart()}
    </EmbedFrame>
  );
};
