import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { FREQUENT_BUS_ROUTE_IDS, getBusRouteDisplayName } from '../../common/constants/lines';
import type { BusSpeedLeaderboardEntry } from '../../common/types/dataPoints';
import { getBusRouteGroup } from '../../common/utils/stations';
import { getFormattedTimeString } from '../../common/utils/time';
import { DWELL_SUMMARY_SIZE, MIN_DWELL_STOPS_PER_DAY } from './constants';
import type {
  BusSpeedSegmentLeaderboardByBand,
  BusSpeedSegmentLeaderboardByDayType,
  BusSpeedSegmentLeaderboardEntry,
  BusSpeedSegmentLeaderboardResponse,
  BusSpeedSegmentProperties,
  DayType,
  Period,
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
 * "0.25 mi · 1m 52s" -- the segment's length and median travel time, the two numbers its
 * p50_speed_mph is computed from. Shared by leaderboard rows and map features; undefined for
 * files published before the pipeline started writing them.
 */
export const segmentDistanceAndTime = (
  entry: Pick<BusSpeedSegmentLeaderboardEntry, 'segment_length_m' | 'p50_total_time_seconds'>
): string | undefined => {
  if (entry.segment_length_m == null || entry.p50_total_time_seconds == null) return undefined;
  const miles = (entry.segment_length_m / METERS_PER_MILE).toFixed(2);
  return `${miles} mi · ${getFormattedTimeString(entry.p50_total_time_seconds)}`;
};

/** " this week" or " this month", to follow "Median of 40 trips"; nothing for a single day. */
export const periodSuffix = (period: Period): string =>
  period === 'daily' ? '' : ` this ${period === 'weekly' ? 'week' : 'month'}`;

/**
 * "25s" -- the median time buses spent at a segment's first stop, which its speed already counts.
 * Undefined for tiles published without it, and for zero, which says nothing about the stop: it
 * can mean most buses pass without stopping, or that trips start there, since a trip's layover at
 * its first stop isn't counted as dwell.
 */
export const segmentDwell = (
  segment: Pick<BusSpeedSegmentProperties, 'median_dwell_seconds'>
): string | undefined =>
  segment.median_dwell_seconds ? getFormattedTimeString(segment.median_dwell_seconds) : undefined;

const formatSpeed = (speed: number): string => speed.toFixed(speed < 10 ? 1 : 0);

/**
 * "2.1-9.0 mph" -- the speeds eight in ten trips fell between, slowest first: enough to tell a
 * section that's always slow from one a few trips hold up. Undefined for tiles published without
 * them, and for a segment with too few trips to say.
 */
export const segmentSpeedRange = (
  segment: Pick<BusSpeedSegmentProperties, 'p10_speed_mph' | 'p90_speed_mph'>
): string | undefined => {
  if (segment.p10_speed_mph == null || segment.p90_speed_mph == null) return undefined;
  return `${formatSpeed(segment.p90_speed_mph)}–${formatSpeed(segment.p10_speed_mph)} mph`;
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

/**
 * A stop's dwell, one row per route in route order, from the segments leaving it. A route that
 * branches at the stop has a segment per next stop, and the one most of its trips took speaks for
 * it. A segment comes back once per tile it crosses, and a pooled one repeats its routes.
 */
export const stopDwellsByRoute = (
  segments: BusSpeedSegmentProperties[]
): BusSpeedSegmentProperties[] => {
  const busiest = new Map<string, BusSpeedSegmentProperties>();
  for (const segment of segments) {
    if (isPooledSegment(segment) || !segmentDwell(segment)) continue;
    const current = busiest.get(segment.route_id);
    if (!current || segment.n_traversals > current.n_traversals) {
      busiest.set(segment.route_id, segment);
    }
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

/**
 * The API ranks raw GTFS route_ids, but the rest of the dashboard shows curated BusRoute labels
 * (SL4/SL5, 114/116/117, ...), so the leaderboard would otherwise list 751 and 749 as separate
 * "SL4" and "SL5" rows. Summing miles_covered/total_time per label keeps the speed a true
 * weighted average, same as the per-route speed page does for composites, then re-ranks
 * slowest first. Dwell is summed the same way, so its averages stay weighted by stops. Routes
 * under one label run on the same days, so the label's days of service are the most of any one
 * route's, not their sum. `date` picks which labels were in service (see getBusRouteGroup).
 */
export const groupLeaderboardByBusRoute = (
  entries: BusSpeedLeaderboardEntry[],
  date: string
): GroupedBusSpeedLeaderboardEntry[] => {
  const groups = new Map<string, GroupedBusSpeedLeaderboardEntry>();
  for (const entry of entries) {
    const route = getBusRouteGroup(entry.route, date);
    const group = groups.get(route) ?? {
      route,
      miles_covered: 0,
      total_time: 0,
      count: 0,
      n_traversals: 0,
      total_dwell: 0,
      n_dwell_stops: 0,
      n_days: 0,
      isFrequentRoute: false,
    };
    group.miles_covered += entry.miles_covered;
    group.total_time += entry.total_time;
    group.count += entry.count;
    group.n_traversals += entry.n_traversals;
    group.total_dwell += entry.total_dwell ?? 0;
    group.n_dwell_stops += entry.n_dwell_stops ?? 0;
    group.n_days = Math.max(group.n_days, entry.n_days ?? 0);
    group.isFrequentRoute ||= FREQUENT_BUS_ROUTES.has(entry.route);
    groups.set(route, group);
  }
  const mph = (entry: BusSpeedLeaderboardEntry) => entry.miles_covered / (entry.total_time / 3600);
  return [...groups.values()].sort((a, b) => mph(a) - mph(b));
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
