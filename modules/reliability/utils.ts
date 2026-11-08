import type { DataPoint } from '../../common/components/charts/TimeSeriesChart';
import type {
  HeadwayCounts,
  ReliabilityCounts,
  ReliabilityEntry,
} from '../../common/types/dataPoints';

type Point = DataPoint & { date: string };

/** Percent, or undefined when nothing was measured (so the chart shows a gap, not 0%). */
export const percent = (numerator?: number, denominator?: number) =>
  numerator != null && denominator ? (100 * numerator) / denominator : undefined;

/** Map each period to a point, dropping periods without a value. */
export const toPoints = (
  data: ReliabilityEntry[],
  value: (entry: ReliabilityEntry) => number | undefined
): Point[] =>
  data.flatMap((entry) => {
    const v = value(entry);
    return v == null || !Number.isFinite(v) ? [] : [{ date: entry.date, value: v }];
  });

/** Average per service day, so partial weeks/months don't read as dips. */
export const perDay = (entry: ReliabilityEntry, count?: number) =>
  count != null && entry.days ? count / entry.days : undefined;

const sum = (data: ReliabilityEntry[], value: (entry: ReliabilityEntry) => number | undefined) =>
  data.reduce((total, entry) => total + (value(entry) ?? 0), 0);

const sumCounts = (counts: (ReliabilityCounts | undefined)[]): ReliabilityCounts => ({
  otpNumerator: counts.reduce((t, c) => t + (c?.otpNumerator ?? 0), 0),
  otpDenominator: counts.reduce((t, c) => t + (c?.otpDenominator ?? 0), 0),
  cancelled: counts.reduce((t, c) => t + (c?.cancelled ?? 0), 0),
});

export const getTheRideStats = (data: ReliabilityEntry[]) => {
  const days = sum(data, (e) => e.days);
  const withNoShows = data.filter((e) => e.noShows != null && e.missed != null);
  return {
    onTime: percent(
      sum(data, (e) => e.onTime),
      sum(data, (e) => e.completed)
    ),
    tripsPerDay: days ? sum(data, (e) => e.completed) / days : undefined,
    missed: withNoShows.length ? sum(withNoShows, (e) => e.missed) : undefined,
    noShows: withNoShows.length ? sum(withNoShows, (e) => e.noShows) : undefined,
  };
};

export const getCommuterRailStats = (data: ReliabilityEntry[]) => {
  const total = sumCounts(data.map((e) => e as ReliabilityCounts));
  const peak = sumCounts(data.map((e) => e.peak));
  const offPeak = sumCounts(data.map((e) => e.offPeak));
  return {
    onTime: percent(total.otpNumerator, total.otpDenominator),
    peakOnTime: percent(peak.otpNumerator, peak.otpDenominator),
    offPeakOnTime: percent(offPeak.otpNumerator, offPeak.otpDenominator),
    cancelled: total.cancelled,
  };
};

export const formatPercent = (value?: number) =>
  value == null || !Number.isFinite(value) ? '—' : `${value.toFixed(1)}%`;

export const formatCount = (value?: number) =>
  value == null || !Number.isFinite(value) ? '—' : Math.round(value).toLocaleString('en-us');

type HeadwayField = keyof HeadwayCounts;

const HEADWAY_FIELDS: HeadwayField[] = [
  'headways_under_50',
  'headways_50_75',
  'headways_75_125',
  'headways_125_150',
  'headways_over_150',
];

export const WITHIN_75_125: HeadwayField[] = ['headways_75_125'];
export const WITHIN_50_150: HeadwayField[] = [
  'headways_50_75',
  'headways_75_125',
  'headways_125_150',
];
export const BUNCHED: HeadwayField[] = ['headways_under_50'];
export const LONG_GAPS: HeadwayField[] = ['headways_over_150'];

const sumFields = (counts: Partial<HeadwayCounts> | undefined, fields: HeadwayField[]) =>
  fields.reduce((total, field) => total + (counts?.[field] ?? 0), 0);

/** Percent of headways in `fields`, or undefined when no headways were counted. */
export const headwayShare = (counts: Partial<HeadwayCounts> | undefined, fields: HeadwayField[]) =>
  percent(sumFields(counts, fields), sumFields(counts, HEADWAY_FIELDS));

export const getSubwayStats = (data: ReliabilityEntry[]) => {
  const total = Object.fromEntries(
    HEADWAY_FIELDS.map((field) => [field, data.reduce((t, e) => t + (e[field] ?? 0), 0)])
  ) as HeadwayCounts;
  return {
    within75: headwayShare(total, WITHIN_75_125),
    within50: headwayShare(total, WITHIN_50_150),
    bunched: headwayShare(total, BUNCHED),
    longGaps: headwayShare(total, LONG_GAPS),
  };
};
