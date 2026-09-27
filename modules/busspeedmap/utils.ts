import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { KEY_BUS_ROUTE_IDS } from '../../common/constants/lines';
import type { BusSpeedLeaderboardEntry } from '../../common/types/dataPoints';
import { getBusRouteGroup } from '../../common/utils/stations';
import type {
  BusSpeedSegmentLeaderboardByBand,
  BusSpeedSegmentLeaderboardByDayType,
  BusSpeedSegmentLeaderboardEntry,
  BusSpeedSegmentLeaderboardResponse,
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

export interface GroupedBusSpeedLeaderboardEntry extends BusSpeedLeaderboardEntry {
  /** Whether any raw route_id behind this curated label is a Key Bus Route. */
  isKeyRoute: boolean;
}

const KEY_BUS_ROUTES = new Set(KEY_BUS_ROUTE_IDS);

/**
 * The API ranks raw GTFS route_ids, but the rest of the dashboard shows curated BusRoute labels
 * (SL4/SL5, 114/116/117, ...), so the leaderboard would otherwise list 751 and 749 as separate
 * "SL4" and "SL5" rows. Summing miles_covered/total_time per label keeps the speed a true
 * weighted average, same as the per-route speed page does for composites, then re-ranks
 * slowest first. `date` picks which labels were in service (see getBusRouteGroup).
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
      isKeyRoute: false,
    };
    group.miles_covered += entry.miles_covered;
    group.total_time += entry.total_time;
    group.count += entry.count;
    group.n_traversals += entry.n_traversals;
    group.isKeyRoute ||= KEY_BUS_ROUTES.has(entry.route);
    groups.set(route, group);
  }
  const mph = (entry: BusSpeedLeaderboardEntry) => entry.miles_covered / (entry.total_time / 3600);
  return [...groups.values()].sort((a, b) => mph(a) - mph(b));
};
