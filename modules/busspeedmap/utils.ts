import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { FREQUENT_BUS_ROUTE_IDS, getBusRouteDisplayName } from '../../common/constants/lines';
import type { BusSpeedLeaderboardEntry, BusTripCounts } from '../../common/types/dataPoints';
import { getBusRouteGroup } from '../../common/utils/stations';
import { getFormattedTimeString } from '../../common/utils/time';
import type { HeadwayField } from '../reliability/utils';
import { HEADWAY_FIELDS } from '../reliability/utils';
import {
  DWELL_SUMMARY_SIZE,
  MIN_DWELL_STOPS_PER_DAY,
  MIN_RUNNING_SPEED_SEGMENT_M,
} from './constants';
import type {
  BusDwellProperties,
  BusSpeedSegmentLeaderboardByBand,
  BusSpeedSegmentLeaderboardByDayType,
  BusSpeedSegmentLeaderboardEntry,
  BusSpeedSegmentLeaderboardResponse,
  BusSpeedSegmentProperties,
  DayType,
  LeaderboardMetricConfig,
  Period,
  StopDwell,
  TimeBand,
} from './types';

dayjs.extend(isoWeek);

/**
 * The single-date picker (shared with the trips pages via dateStoreSection: 'singleTrips')
 * stays the only date control -- weekly/monthly just reinterpret whichever date is already
 * selected as "the week/month containing this date", rather than adding a second picker UI.
 * Undefined for 'daily': the date itself already says which day it is.
 */
export const periodLabel = (date: string | undefined, period: Period): string | undefined => {
  if (!date || period === 'daily') return undefined;
  const day = dayjs(date);
  if (period === 'monthly') return day.format('MMMM YYYY');
  const start = day.startOf('isoWeek');
  const end = day.endOf('isoWeek');
  const endFormat = start.isSame(end, 'month') ? 'D, YYYY' : 'MMM D, YYYY';
  return `Week of ${start.format('MMM D')} – ${end.format(endFormat)}`;
};

/** The current, still-accumulating week/month has a tile too, built from partial data. */
export const isPeriodInProgress = (date: string | undefined, period: Period): boolean => {
  if (!date || period === 'daily') return false;
  const day = dayjs(date);
  const periodEnd = period === 'monthly' ? day.endOf('month') : day.endOf('isoWeek');
  return periodEnd.isAfter(dayjs());
};

/**
 * The route leaderboard's API takes an arbitrary [start_date, end_date] range; the merged
 * leaderboard page derives one from the single selected date the same way the segment
 * leaderboard's file layout already carves up service -- a calendar day, an ISO week
 * (Monday-start), or a calendar month. A still-in-progress week/month is capped at today
 * rather than requesting into the future, matching the "figures reflect service so far" note
 * shown alongside it.
 */
export const periodDateRange = (
  date: string,
  period: Period
): { start_date: string; end_date: string } => {
  const format = 'YYYY-MM-DD';
  if (period === 'daily') return { start_date: date, end_date: date };

  const day = dayjs(date);
  const start = period === 'monthly' ? day.startOf('month') : day.startOf('isoWeek');
  const naturalEnd = period === 'monthly' ? day.endOf('month') : day.endOf('isoWeek');
  const today = dayjs();
  const end = naturalEnd.isAfter(today) ? today : naturalEnd;
  return { start_date: start.format(format), end_date: end.format(format) };
};

/**
 * Daily files are keyed straight by time_band; weekly/monthly nest one level deeper by
 * day_type first. Normalizing that shape difference here means the leaderboard UI can always
 * ask for "this band" without branching on period itself -- a missing key (an empty band, or
 * a still-in-progress period missing a day_type entirely) just reads back as an empty list.
 */
export const selectSegmentLeaderboardEntries = (
  data: BusSpeedSegmentLeaderboardResponse,
  period: Period,
  dayType: DayType,
  timeBand: TimeBand
): BusSpeedSegmentLeaderboardEntry[] => {
  if (period === 'daily') {
    return (data as BusSpeedSegmentLeaderboardByBand)[timeBand] ?? [];
  }
  return (data as BusSpeedSegmentLeaderboardByDayType)[dayType]?.[timeBand] ?? [];
};

const METERS_PER_MILE = 1609.344;

/**
 * The segment's median speed: its running speed, or in an archive published before there was
 * one, its arrival-to-arrival speed (see ArrivalToArrivalSpeeds). Undefined for a segment too
 * short to time.
 */
export const segmentSpeed = (
  segment: Pick<BusSpeedSegmentProperties, 'p50_running_speed_mph' | 'p50_speed_mph'>
): number | undefined => segment.p50_running_speed_mph ?? segment.p50_speed_mph;

/** "12.4 mph", or "No speed" for a segment too short to time. */
export const formatSegmentSpeed = (
  segment: Pick<BusSpeedSegmentProperties, 'p50_running_speed_mph' | 'p50_speed_mph'>
): string => {
  const speed = segmentSpeed(segment);
  return speed == null ? 'No speed' : `${speed.toFixed(1)} mph`;
};

const formatMiles = (meters: number): string => `${(meters / METERS_PER_MILE).toFixed(2)} mi`;

/**
 * "0.19 mi · 42s" -- the two numbers the segment's speed is computed from: the running length
 * and median running time, or for an older file, the whole segment and its arrival-to-arrival
 * time. Shared by leaderboard rows and map features; undefined for a segment too short to time,
 * and for files published before the pipeline started writing them.
 */
export const segmentDistanceAndTime = (
  entry: Pick<
    BusSpeedSegmentLeaderboardEntry,
    'running_length_m' | 'p50_running_time_seconds' | 'segment_length_m' | 'p50_total_time_seconds'
  >
): string | undefined => {
  const [meters, seconds] =
    entry.p50_running_time_seconds != null
      ? [entry.running_length_m, entry.p50_running_time_seconds]
      : [entry.segment_length_m, entry.p50_total_time_seconds];
  if (meters == null || seconds == null) return undefined;
  return `${formatMiles(meters)} · ${getFormattedTimeString(seconds)}`;
};

/**
 * Why a segment has no speed, for its popup: almost always that its stops are too close together
 * to time, as LAMP's times leave out about 90m around them.
 */
export const noSpeedReason = (
  segment: Pick<BusSpeedSegmentProperties, 'segment_length_m'>
): string =>
  segment.segment_length_m != null && segment.segment_length_m < MIN_RUNNING_SPEED_SEGMENT_M
    ? `Stops ${formatMiles(segment.segment_length_m)} apart, too close together to time.`
    : 'Too few trips with usable times to give a speed.';

/** " this week" or " this month", to follow "Median of 40 trips"; nothing for a single day. */
export const periodSuffix = (period: Period): string =>
  period === 'daily' ? '' : ` this ${period === 'weekly' ? 'week' : 'month'}`;

/** "25s", or "1m 05s" for a long hold. */
export const formatDwell = (seconds: number): string => getFormattedTimeString(seconds);

/**
 * "25s" -- in an archive published before dwell had a layer of its own, the median time buses
 * spent at a segment's first stop, which its speed counts. Undefined for newer archives, whose
 * speeds leave it out, and for zero, which says nothing about the stop: it can mean most buses
 * pass without stopping, or that trips start there, since a trip's layover at its first stop
 * isn't counted as dwell.
 */
export const segmentDwell = (
  segment: Pick<BusSpeedSegmentProperties, 'median_dwell_seconds'>
): string | undefined =>
  segment.median_dwell_seconds ? formatDwell(segment.median_dwell_seconds) : undefined;

const formatSpeed = (speed: number): string => speed.toFixed(speed < 10 ? 1 : 0);

/**
 * How much longer the segment's median trip took than in light traffic (its free-flow running time,
 * see BusSpeedSegmentProperties): as a ratio, and in seconds. Undefined without a free-flow time,
 * and for a segment with no running speed: one too short to time, whose few seconds of running
 * time would make the ratio noise. Seconds can be negative, as the early morning can run faster.
 */
export const segmentDelay = (
  segment: Pick<
    BusSpeedSegmentProperties,
    'p50_running_speed_mph' | 'p50_running_time_seconds' | 'free_flow_running_time_seconds'
  >
): { ratio: number; seconds: number } | undefined => {
  const { p50_running_speed_mph, p50_running_time_seconds, free_flow_running_time_seconds } =
    segment;
  if (p50_running_speed_mph == null || p50_running_time_seconds == null) return undefined;
  if (!free_flow_running_time_seconds) return undefined;
  return {
    ratio: p50_running_time_seconds / free_flow_running_time_seconds,
    seconds: p50_running_time_seconds - free_flow_running_time_seconds,
  };
};

/**
 * "21s slower than in light traffic (1.6×)", or "About as fast as in light traffic" within a
 * second or 5% of it, including where it ran faster. Undefined where segmentDelay is.
 */
export const formatSegmentDelay = (
  segment: Parameters<typeof segmentDelay>[0]
): string | undefined => {
  const delay = segmentDelay(segment);
  if (!delay) return undefined;
  if (delay.seconds < 1 || delay.ratio < 1.05) return 'About as fast as in light traffic';
  return `${getFormattedTimeString(delay.seconds)} slower than in light traffic (${delay.ratio.toFixed(1)}×)`;
};

/**
 * "2.1-9.0 mph" -- the speeds eight in ten trips fell between, slowest first: enough to tell a
 * section that's always slow from one a few trips hold up. Undefined for tiles published without
 * them, and for a segment with too few trips to say.
 */
export const segmentSpeedRange = (
  segment: Pick<
    BusSpeedSegmentProperties,
    'p10_running_speed_mph' | 'p90_running_speed_mph' | 'p10_speed_mph' | 'p90_speed_mph'
  >
): string | undefined => {
  const fastest = segment.p10_running_speed_mph ?? segment.p10_speed_mph;
  const slowest = segment.p90_running_speed_mph ?? segment.p90_speed_mph;
  if (fastest == null || slowest == null) return undefined;
  return `${formatSpeed(slowest)}–${formatSpeed(fastest)} mph`;
};

/**
 * Every `shared_routes` a pooled segment could carry with all of its routes among `routeIds`:
 * each combination of two or more, sorted and comma-joined as the pipeline writes them ("749,751"
 * for SL4/SL5). A plain string sort, as there, so "19,8" rather than "8,19".
 */
export const sharedRouteKeys = (routeIds: string[]): string[] =>
  [...new Set(routeIds)]
    .sort()
    .reduce<string[][]>(
      (combinations, routeId) => [
        ...combinations,
        ...combinations.map((combination) => [...combination, routeId]),
      ],
      [[]]
    )
    .filter((combination) => combination.length > 1)
    .map((combination) => combination.join(','));

/** The feature that stands in for every route on its stop pair (see `shared_routes`). */
export const isPooledSegment = (
  segment: Pick<BusSpeedSegmentProperties, 'route_id' | 'shared_routes'>
): boolean => segment.route_id === segment.shared_routes;

/** Route names in the order a rider would list them: SL1 before SL2, 9 before 10. */
export const compareRouteNames = (a: string, b: string): number =>
  a.localeCompare(b, 'en', { numeric: true });

/** A dwell point's figures, for the stop's popup. */
export const dwellFromPoint = (point: BusDwellProperties): StopDwell => ({
  route_id: point.route_id,
  median_dwell_seconds: point.median_dwell_seconds,
  p90_dwell_seconds: point.p90_dwell_seconds,
  n_trips: point.n_dwells,
});

/**
 * The dwell an older archive's segment carries for its first stop, for that stop's popup.
 * Undefined for a pooled segment, which repeats its routes, and wherever segmentDwell is.
 */
export const dwellFromSegment = (segment: BusSpeedSegmentProperties): StopDwell | undefined =>
  !isPooledSegment(segment) && segmentDwell(segment) && segment.median_dwell_seconds
    ? {
        route_id: segment.route_id,
        median_dwell_seconds: segment.median_dwell_seconds,
        n_trips: segment.n_traversals,
      }
    : undefined;

/**
 * A stop's dwell, one row per route in route order. Where a route has more than one -- in an
 * older archive, a segment per next stop where the route branches; in either, the stop served in
 * both directions -- the one with the most trips speaks for it. A feature comes back once per
 * tile it's in, so duplicates are expected.
 */
export const stopDwellsByRoute = (dwells: (StopDwell | undefined)[]): StopDwell[] => {
  const busiest = new Map<string, StopDwell>();
  for (const dwell of dwells) {
    if (!dwell) continue;
    const current = busiest.get(dwell.route_id);
    if (!current || dwell.n_trips > current.n_trips) busiest.set(dwell.route_id, dwell);
  }
  return [...busiest.values()].sort((a, b) =>
    compareRouteNames(getBusRouteDisplayName(a.route_id), getBusRouteDisplayName(b.route_id))
  );
};

export interface GroupedBusSpeedLeaderboardEntry extends BusSpeedLeaderboardEntry {
  total_dwell: number;
  n_dwell_stops: number;
  /** Days any raw route_id behind this label had speed data: the most of any one of them. */
  n_days: number;
  /** Whether any raw route_id behind this curated label is a Frequent Bus Route. */
  isFrequentRoute: boolean;
}

const FREQUENT_BUS_ROUTES = new Set(FREQUENT_BUS_ROUTE_IDS);

const sumOf = <T>(items: T[], pick: (item: T) => number): number =>
  items.reduce((total, item) => total + pick(item), 0);

/**
 * The battery share of several routes' trips together, each weighted by the trips it sampled,
 * the same way the API pools the days of one route (_rollup_fleet_fields). Empty if none of them
 * has fleet data.
 */
const poolBatteryShare = (
  entries: BusSpeedLeaderboardEntry[]
): Pick<BusSpeedLeaderboardEntry, 'fleet_trips' | 'pct_battery_trips'> => {
  const sampled = entries.filter((entry) => entry.fleet_trips && entry.pct_battery_trips != null);
  if (sampled.length === 0) return {};
  const fleetTrips = sumOf(sampled, (entry) => entry.fleet_trips ?? 0);
  const batteryShare =
    sumOf(sampled, (entry) => (entry.pct_battery_trips ?? 0) * (entry.fleet_trips ?? 0)) /
    fleetTrips;
  return { fleet_trips: fleetTrips, pct_battery_trips: batteryShare };
};

/**
 * Each of `fields` summed over the entries that have it, and left off when none does, so a range
 * from before the pipeline counted it reads as unmeasured rather than as zero.
 */
const sumPresent = <F extends HeadwayField | keyof BusTripCounts>(
  entries: BusSpeedLeaderboardEntry[],
  fields: readonly F[]
): Partial<Record<F, number>> =>
  Object.fromEntries(
    fields.flatMap((field) => {
      const counted = entries.filter((entry) => entry[field] != null);
      return counted.length ? [[field, sumOf(counted, (entry) => entry[field] ?? 0)]] : [];
    })
  ) as Partial<Record<F, number>>;

/**
 * Each headway count summed over the Frequent Bus Routes among `entries` that have it (116 of
 * 114/116/117), as on the route overview, so a timetabled route's longer headways don't count toward
 * a frequent one. Left off when none has it, so a label with no frequent routes, or a range before the
 * counts start, has no headway share to rank by.
 */
const poolFrequentHeadways = (
  entries: BusSpeedLeaderboardEntry[]
): Partial<Record<HeadwayField, number>> =>
  sumPresent(
    entries.filter((entry) => FREQUENT_BUS_ROUTES.has(entry.route)),
    HEADWAY_FIELDS
  );

const TRIP_COUNT_FIELDS = [
  'scheduled_trips',
  'unobserved_trips',
  'unobserved_waived_trips',
] as const satisfies readonly (keyof BusTripCounts)[];

/**
 * The API ranks raw GTFS route_ids, but the rest of the dashboard shows curated BusRoute labels
 * (SL4/SL5, 114/116/117, ...), so the leaderboard would otherwise list 751 and 749 as separate
 * "SL4" and "SL5" rows. Summing miles_covered/total_time per label keeps the speed a true
 * weighted average, same as the per-route speed page does for composites, and the battery share
 * is pooled by trips the same way. Dwell is summed too, so its averages stay weighted by stops.
 * Headway counts are pooled from the label's Frequent Bus Routes only (see poolFrequentHeadways), and
 * trip counts from all of them, so its dropped-trip rate is pooled over trips.
 * Routes under one label run on the same days, so the label's days of service are the most of any
 * one route's, not their sum. `date` picks which labels were in service (see getBusRouteGroup).
 * Unordered: rankLeaderboard sorts by whichever metric is picked.
 */
export const groupLeaderboardByBusRoute = (
  entries: BusSpeedLeaderboardEntry[],
  date: string
): GroupedBusSpeedLeaderboardEntry[] => {
  const groups = new Map<string, BusSpeedLeaderboardEntry[]>();
  for (const entry of entries) {
    const route = getBusRouteGroup(entry.route, date);
    groups.set(route, [...(groups.get(route) ?? []), entry]);
  }
  return [...groups].map(([route, members]) => ({
    route,
    miles_covered: sumOf(members, (entry) => entry.miles_covered),
    total_time: sumOf(members, (entry) => entry.total_time),
    count: sumOf(members, (entry) => entry.count),
    n_traversals: sumOf(members, (entry) => entry.n_traversals),
    total_dwell: sumOf(members, (entry) => entry.total_dwell ?? 0),
    n_dwell_stops: sumOf(members, (entry) => entry.n_dwell_stops ?? 0),
    n_days: Math.max(0, ...members.map((entry) => entry.n_days ?? 0)),
    ...poolBatteryShare(members),
    ...poolFrequentHeadways(members),
    ...sumPresent(members, TRIP_COUNT_FIELDS),
    isFrequentRoute: members.some((entry) => FREQUENT_BUS_ROUTES.has(entry.route)),
  }));
};

export interface BusDwellSummary {
  /** Seconds per stop and share of route time, pooled over every route given that has dwell. */
  overall: { averageDwell: number; dwellShare: number } | undefined;
  /** Longest average dwell per stop first, among routes serving enough stops. */
  byAverageDwell: GroupedBusSpeedLeaderboardEntry[];
  /** Largest share of route time spent at stops first, among routes serving enough stops. */
  byDwellShare: GroupedBusSpeedLeaderboardEntry[];
}

/** Seconds spent around each stop, on average. */
export const averageDwell = (entry: GroupedBusSpeedLeaderboardEntry): number =>
  entry.total_dwell / entry.n_dwell_stops;

/** The share of time spent around stops, as total_time runs arrival to arrival. */
export const dwellShare = (entry: GroupedBusSpeedLeaderboardEntry): number =>
  entry.total_dwell / entry.total_time;

/**
 * The leaderboard's dwell summary: the routes with the longest average dwell per stop, and with
 * the largest share of their time spent at stops. Routes serving fewer than
 * MIN_DWELL_STOPS_PER_DAY stops per day of service are left out of both lists, which also drops
 * leaderboards computed before the dwell fields existed (no stops, no days).
 */
export const summarizeDwell = (entries: GroupedBusSpeedLeaderboardEntry[]): BusDwellSummary => {
  const withDwell = entries.filter((entry) => entry.n_dwell_stops > 0);
  const totalDwell = withDwell.reduce((sum, entry) => sum + entry.total_dwell, 0);
  const totalStops = withDwell.reduce((sum, entry) => sum + entry.n_dwell_stops, 0);
  const totalTime = withDwell.reduce((sum, entry) => sum + entry.total_time, 0);
  const ranked = withDwell.filter(
    (entry) => entry.n_days > 0 && entry.n_dwell_stops >= MIN_DWELL_STOPS_PER_DAY * entry.n_days
  );
  const top = (value: (entry: GroupedBusSpeedLeaderboardEntry) => number) =>
    [...ranked].sort((a, b) => value(b) - value(a)).slice(0, DWELL_SUMMARY_SIZE);
  return {
    overall: withDwell.length
      ? { averageDwell: totalDwell / totalStops, dwellShare: totalDwell / totalTime }
      : undefined,
    byAverageDwell: top(averageDwell),
    byDwellShare: top(dwellShare),
  };
};

export interface RankedBusRoute {
  route: string;
  value: number;
  /** See LeaderboardMetricConfig's `detail`. */
  detail?: string;
  isFrequentRoute: boolean;
}

/** The routes `metric` has a figure for, in its order (see LeaderboardMetricConfig). */
export const rankLeaderboard = (
  entries: GroupedBusSpeedLeaderboardEntry[],
  metric: LeaderboardMetricConfig
): RankedBusRoute[] =>
  entries
    .flatMap((entry) => {
      const value = metric.value(entry);
      return value === undefined
        ? []
        : [
            {
              route: entry.route,
              value,
              detail: metric.detail?.(entry),
              isFrequentRoute: entry.isFrequentRoute,
            },
          ];
    })
    .sort((a, b) => (metric.order === 'ascending' ? a.value - b.value : b.value - a.value));

/**
 * The routes `metric` ranks, and the ones it sets aside to list below them (see its `setAside`),
 * each in its order.
 */
export const rankAndSetAside = (
  entries: GroupedBusSpeedLeaderboardEntry[],
  metric: LeaderboardMetricConfig
): { ranked: RankedBusRoute[]; setAside: RankedBusRoute[] } => {
  const isSetAside = (entry: GroupedBusSpeedLeaderboardEntry) =>
    metric.setAside?.test(entry) ?? false;
  return {
    ranked: rankLeaderboard(
      entries.filter((entry) => !isSetAside(entry)),
      metric
    ),
    setAside: rankLeaderboard(entries.filter(isSetAside), metric),
  };
};
