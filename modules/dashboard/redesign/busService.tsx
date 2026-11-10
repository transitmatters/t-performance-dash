import { useCallback, useMemo } from 'react';
import type { TooltipItem } from 'chart.js';
import dayjs from 'dayjs';

import { TimeSeriesChart } from '../../../common/components/charts/TimeSeriesChart';
import type { ValueAxis } from '../../../common/components/charts/TimeSeriesChart';
import type { HoverCardContent } from '../../../common/components/charts/hoverCard/types';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { Notice } from '../../../common/components/notices/Notice';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import type { BusTripCounts } from '../../../common/types/dataPoints';
import { groupByCalendarMonth, splitTrailingWindows } from '../../../common/utils/dateAggregation';
import { deltaSentimentFor } from './scorecardUtils';
import type { ScorecardRow } from './types';

/**
 * A bus route's service, from LAMP's trip counts: every scheduled trip, and the ones with no
 * observed stop. A trip with no observed stop is our estimate of a dropped trip, though a bus that
 * ran with its tracking off looks the same. The counts start 2025-12-24.
 */

type DatedCounts = BusTripCounts & { date: string };
type CountedDay = DatedCounts & { scheduled_trips: number };

interface TripTotals {
  scheduled: number;
  dropped: number;
  /** The dropped trips that have an MBTA waiver */
  waived: number;
}

export interface BusServiceSummary {
  /** The latest day with trip counts, where the 30 days end */
  end: string;
  /** The last 30 days, which the row pools and the chart shows */
  days: CountedDay[];
  current: TripTotals;
  /** The 30 days before those, or null if there are no counts that far back */
  prior: TripTotals | null;
}

const WINDOW_DAYS = 30;

const hasTripCounts = <T extends DatedCounts>(row: T): row is T & { scheduled_trips: number } =>
  Boolean(row.scheduled_trips);

const sumTrips = (rows: BusTripCounts[]): TripTotals =>
  rows.reduce(
    (totals, row) => ({
      scheduled: totals.scheduled + (row.scheduled_trips ?? 0),
      dropped: totals.dropped + (row.unobserved_trips ?? 0),
      waived: totals.waived + (row.unobserved_waived_trips ?? 0),
    }),
    { scheduled: 0, dropped: 0, waived: 0 }
  );

/** Pooled over the trips, not averaged over days, so a quiet Sunday counts for less than a weekday. */
const deliveredPct = ({ scheduled, dropped }: TripTotals) => 100 * (1 - dropped / scheduled);

/** One decimal, without rounding up to 100% while any trip was dropped. */
export const formatDeliveredPct = (value: number) => {
  if (value >= 100) return '100%';
  const text = value.toFixed(1);
  return text === '100.0' ? '99.9%' : `${text}%`;
};

/** Signed percentage points, without a "-0.0" for a change that rounds to nothing. */
const formatPoints = (delta: number) => {
  const rounded = Math.round(delta * 10) / 10;
  if (rounded === 0) return '0.0';
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)}`;
};

/**
 * Two standard errors of the difference between the two windows' rates, in percentage points. A
 * smaller change is about what chance alone would give, so it reads as flat: on a route running
 * 200 trips a day, a handful of dropped trips moves the rate by 0.1 points. Dropped trips cluster
 * (a missing operator drops a run of trips), so the real noise is larger and this errs toward
 * calling a change.
 */
const noiseBand = (a: TripTotals, b: TripTotals) => {
  const p = (a.dropped + b.dropped) / (a.scheduled + b.scheduled);
  return 2 * 100 * Math.sqrt(p * (1 - p) * (1 / a.scheduled + 1 / b.scheduled));
};

/**
 * Few of the route's dropped trips have a waiver, so some may be buses that ran untracked: Routes
 * 712 and 713 read 12–14% dropped in October 2026 with no waivers at all. Needs enough trips for the
 * share to mean something.
 */
const MIN_DROPPED_FOR_WAIVER_CHECK = 10;
const MAX_WAIVED_SHARE = 0.1;
export const mayIncludeTrackingGaps = ({ dropped, waived }: TripTotals) =>
  dropped >= MIN_DROPPED_FOR_WAIVER_CHECK && waived < MAX_WAIVED_SHARE * dropped;

/** The last 30 days with trip counts and the 30 before, from daily rows. */
export const summarizeBusService = (daily: DatedCounts[]): BusServiceSummary | null => {
  const windows = splitTrailingWindows(daily.filter(hasTripCounts), WINDOW_DAYS);
  if (!windows) return null;
  return {
    end: windows.end,
    days: windows.current,
    current: sumTrips(windows.current),
    prior: windows.prior.length ? sumTrips(windows.prior) : null,
  };
};

/**
 * The Service delivered row: the share of the last 30 days' scheduled trips that ran, against the
 * 30 days before, and a monthly trend from the weekly rows (each week in the month it starts).
 */
export const buildBusServiceRow = (
  summary: BusServiceSummary,
  weekly: DatedCounts[],
  color: string
): ScorecardRow => {
  const { current, prior } = summary;
  const currentValue = deliveredPct(current);
  const delta = prior ? currentValue - deliveredPct(prior) : null;
  const sentiment = deltaSentimentFor(delta, prior ? noiseBand(current, prior) : 0, true);
  const trend = groupByCalendarMonth(weekly.filter(hasTripCounts)).map(({ items }) =>
    deliveredPct(sumTrips(items))
  );

  return {
    key: 'service',
    label: 'Service delivered',
    subtitle: `${current.dropped.toLocaleString()} of ${current.scheduled.toLocaleString()} trips dropped (est.)`,
    formattedCurrent: formatDeliveredPct(currentValue),
    currentValue,
    formatValue: formatDeliveredPct,
    unit: 'of trips',
    deltaLabel:
      delta === null
        ? 'Not enough data'
        : `${formatPoints(delta)} pts · ${sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse'}`,
    deltaValueLabel: delta === null ? '—' : formatPoints(delta),
    deltaSentiment: sentiment,
    trend,
    color,
  };
};

const VALUE_AXIS: ValueAxis = {
  label: 'Trips dropped',
  min: 0,
  // Whole trips only, so a quiet month doesn't get ticks at 0.5
  renderTickLabel: (value) => (Number.isInteger(value) ? value.toLocaleString() : ''),
};

const HIDDEN_LEGEND = { visible: false };

const TrackingGapNotice = ({ dropped, waived }: Pick<TripTotals, 'dropped' | 'waived'>) => (
  <Notice variant="warning" title="Some of these may be tracking gaps">
    <p>
      {waived === 0 ? 'None' : `Only ${waived.toLocaleString()}`} of the {dropped.toLocaleString()}{' '}
      trips with no recorded stops {waived === 1 ? 'has' : 'have'} an MBTA waiver. Buses that ran
      without tracking may make this rate too high.
    </p>
  </Notice>
);

const ServiceChart = ({ summary, color }: { summary: BusServiceSummary; color: string }) => {
  const { days, end, current } = summary;

  const data = useMemo(
    () => [
      {
        label: 'Trips dropped (est.)',
        data: days.map((day) => ({ date: day.date, value: day.unobserved_trips ?? 0 })),
        style: { bar: true, color },
      },
    ],
    [days, color]
  );
  const timeAxis = useMemo(
    () => ({
      granularity: 'day' as const,
      from: dayjs(end)
        .subtract(WINDOW_DAYS - 1, 'day')
        .format('YYYY-MM-DD'),
      to: end,
    }),
    [end]
  );

  const hoverCard = useCallback(
    (items: TooltipItem<'line'>[]): HoverCardContent | null => {
      const day = days[items[0]?.dataIndex];
      if (!day) return null;
      const dayTotals = sumTrips([day]);
      return {
        hero: {
          value: dayTotals.dropped.toLocaleString(),
          unit: `of ${dayTotals.scheduled.toLocaleString()} trips dropped`,
          color,
        },
        rows: [
          { label: 'Service delivered', value: formatDeliveredPct(deliveredPct(dayTotals)) },
          { label: 'With an MBTA waiver', value: dayTotals.waived.toLocaleString() },
        ],
      };
    },
    [days, color]
  );

  return (
    <ChartStack className="gap-y-4">
      <TimeSeriesChart
        data={data}
        timeAxis={timeAxis}
        valueAxis={VALUE_AXIS}
        legend={HIDDEN_LEGEND}
        hoverCard={hoverCard}
      />
      {mayIncludeTrackingGaps(current) && (
        <TrackingGapNotice dropped={current.dropped} waived={current.waived} />
      )}
      <Notice>
        <p>
          Estimated. A trip counts as dropped when it was scheduled but the MBTA&apos;s tracking
          data (LAMP) recorded none of its stops, which also happens when a bus runs with its
          tracking off. These counts start December 24, 2025.
        </p>
      </Notice>
    </ChartStack>
  );
};

/** Trips dropped per day over the 30 days the Service delivered row pools. */
export const BusServiceChart = ({ daily, color }: { daily: DatedCounts[]; color: string }) => {
  const summary = useMemo(() => summarizeBusService(daily), [daily]);
  if (!summary) return <NoDataNotice isLineMetric message="No trip counts in the last 60 days." />;
  return <ServiceChart summary={summary} color={color} />;
};
