import type { HeadwayDirection } from '../../common/hooks/usePageFilters';
import type {
  ExcessTripTimeEntry,
  ExcessTripTimePeriod,
  ExcessTripTimeScope,
  ExcessTripTimeSums,
} from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';
import { percent } from './utils';

/** The lines the MBTA publishes excess trip time for. It plans to add the Green Line. */
export const EXCESS_TRIP_TIME_LINES: Line[] = ['line-red', 'line-orange', 'line-blue'];

export const hasExcessTripTime = (line?: Line) =>
  line !== undefined && EXCESS_TRIP_TIME_LINES.includes(line);

export const PERIODS: { key: ExcessTripTimePeriod; label: string }[] = [
  { key: 'amPeak', label: 'AM peak' },
  { key: 'pmPeak', label: 'PM peak' },
  { key: 'offPeak', label: 'Off-peak' },
];

/** One period's sums, for both directions or one. */
export interface EttRow {
  date: string;
  days: number;
  sums?: ExcessTripTimeScope;
}

export const toEttRows = (data: ExcessTripTimeEntry[], direction: HeadwayDirection): EttRow[] =>
  data.map((entry) => ({
    date: entry.date,
    days: entry.days,
    sums: direction === 'both' ? entry : entry.byDirection?.[direction],
  }));

/** Minutes per rider, or undefined when no riders were counted (so a chart shows a gap). */
const perRider = (minutes: number, sums?: ExcessTripTimeSums) =>
  sums?.riders ? minutes / sums.riders : undefined;

export const excessWait = (sums?: ExcessTripTimeSums) =>
  sums && perRider(sums.waitTime - sums.baselineWaitTime, sums);

export const excessTravel = (sums?: ExcessTripTimeSums) =>
  sums && perRider(sums.travelTime - sums.baselineTravelTime, sums);

/**
 * Excess trip time per rider, by the MBTA's formula: (wait + travel) − (baseline wait + baseline
 * travel). It's always excess wait plus excess travel. The dataset's own baseline trip time is a
 * little under the two baselines' sum in a few percent of half hours, by about a second per rider.
 */
export const excessTripTime = (sums?: ExcessTripTimeSums) =>
  sums &&
  perRider(sums.waitTime + sums.travelTime - sums.baselineWaitTime - sums.baselineTravelTime, sums);

/** The MBTA's standard: the share of riders whose trip was at most 5 minutes over the baseline. */
export const withinFiveShare = (sums?: ExcessTripTimeSums) =>
  percent(sums?.withinFiveMin, sums?.riders);

export const withinTwentyShare = (sums?: ExcessTripTimeSums) =>
  percent(sums?.withinTwentyMin, sums?.riders);

const FIELDS: (keyof ExcessTripTimeSums)[] = [
  'riders',
  'waitTime',
  'travelTime',
  'baselineTripTime',
  'baselineWaitTime',
  'baselineTravelTime',
  'withinFiveMin',
  'withinTwentyMin',
  'withinTwentyPct',
  'withinThirtyPct',
];

/** Every row's sums added up, for the stat cards. Averages come from the totals, not from averaging each period. */
export const sumEttRows = (rows: EttRow[]) => {
  const totals = Object.fromEntries(
    FIELDS.map((field) => [field, rows.reduce((t, row) => t + (row.sums?.[field] ?? 0), 0)])
  ) as ExcessTripTimeSums;
  const days = rows.reduce((t, row) => t + (row.sums ? row.days : 0), 0);
  return { ...totals, days };
};

const MINUS = '−';

/** Signed minutes to a tenth, e.g. "+1.6" or "−0.4". Values that round to zero read "0.0". */
export const formatMinutes = (value?: number) => {
  if (value == null || !Number.isFinite(value)) return '—';
  const rounded = value.toFixed(1);
  if (Number(rounded) === 0) return '0.0';
  return value > 0 ? `+${rounded}` : `${MINUS}${rounded.slice(1)}`;
};
