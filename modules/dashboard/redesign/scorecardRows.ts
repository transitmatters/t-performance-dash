import dayjs from 'dayjs';
import { useMemo } from 'react';

import { useDeliveredTripMetrics } from '../../../common/api/hooks/tripmetrics';
import { useRidershipData } from '../../../common/api/hooks/ridership';
import { getRidershipLineId } from '../../../common/utils/ridership';
import { useSlowzoneAllData, useSlowzoneDelayTotalData } from '../../../common/api/hooks/slowzones';
import {
  PEAK_SPEED,
  PEAK_SCHEDULED_SERVICE,
  PEAK_RIDERSHIP,
} from '../../../common/constants/baselines';
import { LINE_COLORS } from '../../../common/constants/colors';
import { TODAY_STRING } from '../../../common/constants/dates';
import { getFormattedTimeString } from '../../../common/utils/time';
import { getWorstSlowZoneSegment, getStationPairName } from '../../../common/utils/slowZoneUtils';
import type { DatedValue } from '../../../common/utils/dateAggregation';
import { getMonthlyDelta, getMonthlyTrend } from '../../../common/utils/dateAggregation';
import type { Line, LineShort } from '../../../common/types/lines';
import type { DayDelayTotals } from '../../../common/types/dataPoints';
import type { RidershipKey } from '../../../common/types/ridership';
import type { ScorecardRow, DeltaSentiment, MetricKey } from './types';

/** The scorecard is calendar-month-shaped, so it fetches its own fixed trailing window
 * independent of the page's Week/Month/Year/All-time selector (which is trailing-N-days
 * and isn't guaranteed to contain a full prior calendar month). */
const WINDOW_START = dayjs().subtract(400, 'day').format('YYYY-MM-DD');

const formatCompact = (value: number): string => {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return Math.round(value).toLocaleString();
};

const deltaSentimentFor = (
  delta: number | null,
  negligible: number,
  higherIsBetter: boolean
): DeltaSentiment => {
  if (delta === null || Math.abs(delta) <= negligible) return 'flat';
  const better = higherIsBetter ? delta > 0 : delta < 0;
  return better ? 'good' : 'bad';
};

const buildRow = (params: {
  key: MetricKey;
  label: string;
  subtitle: string;
  points: DatedValue[];
  reducer: 'avg' | 'sum';
  unit: string;
  formatValue: (value: number) => string;
  benchmark: number | null;
  benchmarkFormatted: (benchmark: number) => string;
  negligibleDelta: number;
  higherIsBetter: boolean;
  color: string;
}): ScorecardRow | null => {
  const { thisMonth, delta } = getMonthlyDelta(params.points, params.reducer);
  if (!Number.isFinite(thisMonth)) return null;
  const trend = getMonthlyTrend(params.points, params.reducer);
  const sentiment = deltaSentimentFor(delta, params.negligibleDelta, params.higherIsBetter);
  const percentOfBenchmark = params.benchmark ? thisMonth / params.benchmark : null;

  return {
    key: params.key,
    label: params.label,
    subtitle: params.subtitle,
    formattedCurrent: params.formatValue(thisMonth),
    unit: params.unit,
    benchmarkLabel: params.benchmark ? params.benchmarkFormatted(params.benchmark) : '—',
    percentOfBenchmark: percentOfBenchmark === null ? null : Math.min(percentOfBenchmark, 1),
    deltaLabel:
      delta === null
        ? 'Not enough data'
        : `${delta > 0 ? '+' : ''}${params.formatValue(delta)} · ${sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse'}`,
    deltaSentiment: sentiment,
    trend,
    color: params.color,
  };
};

export const useScorecardRows = (line: Line | undefined, lineShort: LineShort | undefined) => {
  const enabled = Boolean(line);

  const tripMetrics = useDeliveredTripMetrics(
    { start_date: WINDOW_START, end_date: TODAY_STRING, agg: 'weekly', line },
    enabled
  );
  const ridership = useRidershipData(
    {
      line_id: getRidershipLineId(line, undefined, undefined, undefined),
      start_date: WINDOW_START,
      end_date: TODAY_STRING,
    },
    enabled
  );
  const delayTotals = useSlowzoneDelayTotalData();
  const allSlow = useSlowzoneAllData();

  const rows = useMemo(() => {
    if (!line) return [];
    const color = LINE_COLORS[line];
    const built: ScorecardRow[] = [];

    if (tripMetrics.data) {
      const speedPoints: DatedValue[] = tripMetrics.data
        .filter((point) => point.miles_covered)
        .map((point) => ({
          date: point.date,
          value: point.miles_covered / (point.total_time / 3600),
        }));
      const speedRow = buildRow({
        key: 'speed',
        label: 'Speed',
        subtitle: 'Average, both directions',
        points: speedPoints,
        reducer: 'avg',
        unit: 'mph',
        formatValue: (v) => v.toFixed(1),
        benchmark: PEAK_SPEED[line] || null,
        benchmarkFormatted: (b) => `${b.toFixed(1)} mph`,
        negligibleDelta: 0.1,
        higherIsBetter: true,
        color,
      });
      if (speedRow) built.push(speedRow);

      const servicePoints: DatedValue[] = tripMetrics.data
        .filter((point) => point.miles_covered)
        .map((point) => ({ date: point.date, value: point.count }));
      const serviceRow = buildRow({
        key: 'service',
        label: 'Service delivered',
        subtitle: 'Round trips, daily average',
        points: servicePoints,
        reducer: 'avg',
        unit: '/day',
        formatValue: (v) => Math.round(v).toString(),
        benchmark: PEAK_SCHEDULED_SERVICE[line] || null,
        benchmarkFormatted: (b) => `${Math.round(b)} trips`,
        negligibleDelta: 1,
        higherIsBetter: true,
        color,
      });
      if (serviceRow) built.push(serviceRow);
    }

    if (ridership.data) {
      const ridershipPoints: DatedValue[] = ridership.data.map((point) => ({
        date: point.date,
        value: point.count,
      }));
      const ridershipRow = buildRow({
        key: 'ridership',
        label: 'Ridership',
        subtitle: 'Fare validations, daily average',
        points: ridershipPoints,
        reducer: 'avg',
        unit: '/day',
        formatValue: formatCompact,
        benchmark: PEAK_RIDERSHIP[line as RidershipKey] || null,
        benchmarkFormatted: (b) => `${formatCompact(b)}`,
        negligibleDelta: 50,
        higherIsBetter: true,
        color,
      });
      if (ridershipRow) built.push(ridershipRow);
    }

    if (delayTotals.data && lineShort && lineShort in { Red: 1, Orange: 1, Blue: 1, Green: 1 }) {
      const key = lineShort as keyof Omit<DayDelayTotals, 'date'>;
      const windowStartUTC = dayjs.utc(WINDOW_START);
      const slowPoints: DatedValue[] = delayTotals.data.data
        .filter((t) => dayjs.utc(t.date).isAfter(windowStartUTC))
        .map((t) => ({ date: t.date, value: t[key] }));
      // Cumulative time lost — summing each day's "extra time added to a trip" snapshot answers
      // "riding this line daily, how much time would slow zones have cost you this month," which
      // is the more meaningful rider-facing number than an averaged daily severity reading.
      // "Worst on record" is the worst monthly cumulative total in the window.
      const worstOnRecord = Math.max(
        ...getMonthlyTrend(slowPoints, 'sum').filter(Number.isFinite),
        1
      );
      const worstSegment = allSlow.data
        ? getWorstSlowZoneSegment(
            allSlow.data.data,
            dayjs.utc().subtract(30, 'day'),
            dayjs.utc(),
            lineShort
          )
        : null;
      const slowRow = buildRow({
        key: 'slowzones',
        label: 'Slow zones',
        subtitle: worstSegment
          ? `Worst: ${getStationPairName(worstSegment.from, worstSegment.to, true)}`
          : 'No active slow zones',
        points: slowPoints,
        reducer: 'sum',
        unit: 'lost',
        // DayDelayTotals values are seconds (see modules/slowzones/charts/TotalSlowTime.tsx,
        // which divides by 60 before plotting) — not minutes.
        formatValue: (v) => getFormattedTimeString(v, 'seconds'),
        benchmark: worstOnRecord,
        benchmarkFormatted: (b) => `${getFormattedTimeString(b, 'seconds')} worst month in window`,
        negligibleDelta: 60,
        higherIsBetter: false,
        color,
      });
      if (slowRow) built.push(slowRow);
    }

    return built;
  }, [line, lineShort, tripMetrics.data, ridership.data, delayTotals.data, allSlow.data]);

  const isLoading =
    enabled &&
    (tripMetrics.isLoading || ridership.isLoading || delayTotals.isLoading || allSlow.isLoading);

  return { rows, isLoading };
};
