import dayjs from 'dayjs';
import { EmbedFrame } from '../../common/components/embed/EmbedFrame';
import { EmbedMessage } from '../../common/components/embed/EmbedMessage';
import { PRETTY_DATE_FORMAT } from '../../common/constants/dates';
import { DAY_FILTER_OPTIONS } from '../../common/hooks/useChartToggle';
import type { RouteType } from '../../common/types/api';
import type { DayFilter } from '../../common/types/charts';
import type { QueryParams, Tab } from '../../common/types/router';
import { normalizeDateParams } from '../../common/utils/dateParams';
import { useDelimitatedRoute } from '../../common/utils/router';
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
  const route = useDelimitatedRoute();
  const { tab, lineShort, query } = route;
  const single = embed.page === 'single';
  // Fills in missing or out-of-range dates without rewriting the URL, as the slow zone embed does.
  const dates = {
    ...query,
    ...normalizeDateParams({
      section: single ? 'singleTrips' : 'multiTrips',
      tab,
      page: single ? 'singleTrips' : 'multiTrips',
      search: query,
    }),
  };
  const days = getDays(embed, query);

  const fromStation = query.from ? getParentStationForStopId(query.from, lineShort) : undefined;
  const toStation = query.to ? getParentStationForStopId(query.to, lineShort) : undefined;
  const location = getLocationDetails(fromStation, toStation);
  const where = BETWEEN_STOPS.includes(embed.chart)
    ? `${location.from} to ${location.to}`
    : `${location.from}, ${location.direction}`;
  const when = single
    ? formatDate(dates.date as string)
    : `${formatDate(dates.startDate as string)} – ${formatDate(dates.endDate as string)}`;
  const dayLabel = DAY_FILTER_OPTIONS.find(([option]) => option === days && option !== 'all')?.[1];

  const renderChart = () => {
    if (!fromStation || !toStation)
      return <EmbedMessage>This embed is missing its stops.</EmbedMessage>;
    const props = { routeType: ROUTE_TYPES[tab] ?? 'subway', fromStation, toStation } as const;
    return embed.page === 'single' ? (
      <SingleTripEmbedChart chart={embed.chart} date={dates.date as string} {...props} />
    ) : (
      <MultiTripEmbedChart
        chart={embed.chart}
        startDate={dates.startDate as string}
        endDate={dates.endDate as string}
        days={days}
        trendline={query.trend === '1'}
        {...props}
      />
    );
  };

  return (
    <EmbedFrame
      title={getTripEmbedTitle(embed, route)}
      subtitle={[where, when, dayLabel].filter(Boolean).join(' · ')}
      href={getTripPageUrl(embed, { ...route, query: dates })}
    >
      {renderChart()}
    </EmbedFrame>
  );
};
