import dayjs from 'dayjs';
import { getBusRouteDisplayName } from '../../common/constants/lines';
import { useOption } from '../../common/hooks/useChartToggle';
import { getBusSpeedMapRouteHref, useDelimitatedRoute } from '../../common/utils/router';
import {
  ALL_ROUTES,
  DAY_TYPES,
  DEFAULT_DAY_TYPE,
  DEFAULT_DIRECTION,
  DEFAULT_LEADERBOARD_METRIC,
  DEFAULT_LEADERBOARD_VIEW_MODE,
  DEFAULT_PERIOD,
  DEFAULT_TIME_BAND,
  DIRECTIONS,
  LEADERBOARD_METRICS,
  LEADERBOARD_VIEW_MODES,
  PERIODS,
  TIME_BANDS,
} from './constants';
import type {
  DayType,
  DirectionFilter,
  LeaderboardMetric,
  LeaderboardViewMode,
  Period,
  TimeBand,
} from './types';
import { periodLabel } from './utils';

// The speed map's and Rankings' filters. The header renders their controls and the pages read
// them, so each is a hook over its URL param, like common/hooks/usePageFilters.ts.

const options = <K extends string>(list: { key: K; label: string }[]): [K, string][] =>
  list.map(({ key, label }) => [key, label]);

const PERIOD_OPTIONS = options(PERIODS);
const DAY_TYPE_OPTIONS = options(DAY_TYPES);
const DIRECTION_OPTIONS = options(DIRECTIONS);
const METRIC_OPTIONS = options(LEADERBOARD_METRICS);
const VIEW_MODE_OPTIONS = options(LEADERBOARD_VIEW_MODES);
const TIME_BAND_OPTIONS: [TimeBand, string][] = TIME_BANDS.map(({ key, label, hours }) => [
  key,
  key === 'all_day' ? label : `${label} · ${hours}`,
]);

export const usePeriod = () => useOption<Period>(DEFAULT_PERIOD, PERIOD_OPTIONS, 'period');

export const useDayType = () => useOption<DayType>(DEFAULT_DAY_TYPE, DAY_TYPE_OPTIONS, 'dayType');

export const useTimeBand = () => useOption<TimeBand>(DEFAULT_TIME_BAND, TIME_BAND_OPTIONS, 'band');

export const useDirection = () =>
  useOption<DirectionFilter>(DEFAULT_DIRECTION, DIRECTION_OPTIONS, 'direction');

/**
 * The speed map's direction and days in words, as "Outbound · Weekdays". A single day is wholly
 * one day type, so it's named instead: "Outbound · Wednesday".
 */
export const useDirectionAndDays = () => {
  const {
    query: { date },
  } = useDelimitatedRoute();
  const { shown: period } = useShownPeriod();
  const { value: dayType } = useDayType();
  const { value: direction } = useDirection();
  const days =
    period === 'daily'
      ? date && dayjs(date).format('dddd')
      : DAY_TYPES.find(({ key }) => key === dayType)?.label;
  return [DIRECTIONS.find(({ key }) => key === direction)?.label, days].filter(Boolean).join(' · ');
};

/** One route of a combined route like SL4/SL5, or all of them. */
export const useRouteId = (routeIds: string[]) =>
  useOption<string>(
    ALL_ROUTES,
    [
      [ALL_ROUTES, 'All'],
      ...routeIds.map((id): [string, string] => [id, getBusRouteDisplayName(id)]),
    ],
    'routeId'
  );

/** Rankings' Rank by and By route/By segment choices, and the view they leave showing. */
export const useRankings = () => {
  const rankBy = useOption<LeaderboardMetric>(DEFAULT_LEADERBOARD_METRIC, METRIC_OPTIONS, 'rank');
  const view = useOption<LeaderboardViewMode>(
    DEFAULT_LEADERBOARD_VIEW_MODE,
    VIEW_MODE_OPTIONS,
    'rankView'
  );
  const metric =
    LEADERBOARD_METRICS.find((option) => option.key === rankBy.value) ?? LEADERBOARD_METRICS[0];
  // Segments only have a speed, so the other metrics are by route alone. The choice is kept
  // rather than reset, so going back to Speed returns to the view that was showing.
  const hasSegmentView = metric.key === 'speed';
  const viewMode: LeaderboardViewMode = hasSegmentView ? view.value : 'route';
  return { rankBy, view, metric, hasSegmentView, viewMode };
};

/**
 * The period on screen. A Rankings metric that ranks whole months shows the month the date is
 * in, keeping the chosen period for when another metric is picked.
 */
export const useShownPeriod = () => {
  const { page } = useDelimitatedRoute();
  const period = usePeriod();
  const { metric } = useRankings();
  const lockedToMonth = page === 'leaderboard' && Boolean(metric.monthlyOnly);
  const shown: Period = lockedToMonth ? 'monthly' : period.value;
  return { ...period, shown, lockedToMonth };
};

/** The period on screen in words, for places that show it without the date control. */
export const usePeriodDateLabel = () => {
  const {
    query: { date },
  } = useDelimitatedRoute();
  const { shown } = useShownPeriod();
  return periodLabel(date, shown);
};

/** Links a Rankings route to its speed map, showing the period Rankings shows. */
export const useSpeedMapRouteHref = () => {
  const route = useDelimitatedRoute();
  const { shown } = useShownPeriod();
  const period = shown === DEFAULT_PERIOD ? undefined : shown;
  return (busRoute: string) => getBusSpeedMapRouteHref(busRoute, route, period);
};
