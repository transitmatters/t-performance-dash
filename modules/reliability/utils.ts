import type { DataPoint } from '../../common/components/charts/TimeSeriesChart';
import { SEVERITY_COLORS } from '../../common/utils/chartTheme';
import type { PatternShape } from '../../common/utils/chartPatterns';
import type {
  HeadwayCounts,
  ReliabilityCounts,
  ReliabilityEntry,
} from '../../common/types/dataPoints';

type Point = DataPoint & { date: string };

/** Percent, or undefined when nothing was measured (so the chart shows a gap, not 0%). */
export const percent = (numerator?: number | null, denominator?: number | null) =>
  numerator != null && denominator ? (100 * numerator) / denominator : undefined;

/**
 * Map each period to a point, with a null value (a gap) where nothing was measured. Every series
 * keeps one point per period, so a hover card reads the same period from each.
 */
export const toPoints = <Entry extends { date: string }>(
  data: Entry[],
  value: (entry: Entry) => number | null | undefined
): Point[] =>
  data.map((entry) => {
    const v = value(entry);
    return { date: entry.date, value: v == null || !Number.isFinite(v) ? null : v };
  });

/** Average per service day, so partial weeks/months don't read as dips. */
export const perDay = (entry: ReliabilityEntry, count?: number | null) =>
  count != null && entry.days ? count / entry.days : undefined;

const sum = (
  data: ReliabilityEntry[],
  value: (entry: ReliabilityEntry) => number | null | undefined
) => data.reduce((total, entry) => total + (value(entry) ?? 0), 0);

type PartialCounts = { [K in keyof ReliabilityCounts]?: number | null };

const sumCounts = (counts: (PartialCounts | null | undefined)[]): ReliabilityCounts => ({
  otpNumerator: counts.reduce((t, c) => t + (c?.otpNumerator ?? 0), 0),
  otpDenominator: counts.reduce((t, c) => t + (c?.otpDenominator ?? 0), 0),
  cancelled: counts.reduce((t, c) => t + (c?.cancelled ?? 0), 0),
});

export const getTheRideStats = (data: ReliabilityEntry[]) => {
  const days = sum(data, (e) => e.days);
  const withMissed = data.filter((e) => e.missed != null);
  return {
    onTime: percent(
      sum(data, (e) => e.onTime),
      sum(data, (e) => e.completed)
    ),
    tripsPerDay: days ? sum(data, (e) => e.completed) / days : undefined,
    missed: withMissed.length ? sum(withMissed, (e) => e.missed) : undefined,
  };
};

export const getCommuterRailStats = (data: ReliabilityEntry[]) => {
  const total = sumCounts(data);
  const peak = sumCounts(data.map((e) => e.peak));
  return {
    onTime: percent(total.otpNumerator, total.otpDenominator),
    peakOnTime: percent(peak.otpNumerator, peak.otpDenominator),
    cancelled: total.cancelled,
  };
};

export const formatPercent = (value?: number) =>
  value == null || !Number.isFinite(value) ? '—' : `${value.toFixed(1)}%`;

export const formatCount = (value?: number) =>
  value == null || !Number.isFinite(value) ? '—' : Math.round(value).toLocaleString('en-us');

export type HeadwayField = keyof HeadwayCounts;

/** Headway counts as the API sends them, where any count can be missing or null. */
export type PartialHeadwayCounts = { [K in HeadwayField]?: number | null } | null | undefined;

export const HEADWAY_FIELDS: HeadwayField[] = [
  'headways_under_50',
  'headways_50_75',
  'headways_75_125',
  'headways_125_150',
  'headways_over_150',
];

export const ON_TIME: HeadwayField[] = ['headways_75_125'];
export const BUNCHED: HeadwayField[] = ['headways_under_50'];
export const LONG_GAP: HeadwayField[] = ['headways_over_150'];

const sumFields = (counts: PartialHeadwayCounts, fields: HeadwayField[]) =>
  fields.reduce((total, field) => total + (counts?.[field] ?? 0), 0);

/** Percent of headways in `fields`, or undefined when no headways were counted. */
export const headwayShare = (counts: PartialHeadwayCounts, fields: HeadwayField[]) =>
  percent(sumFields(counts, fields), sumFields(counts, HEADWAY_FIELDS));

export const headwayCount = (counts: PartialHeadwayCounts) => sumFields(counts, HEADWAY_FIELDS);

export interface HeadwayBucket {
  field: HeadwayField;
  label: string;
  range: string;
  /** Which side of the scheduled headway it falls on. */
  side: 'closer' | 'on' | 'longer';
  color: string;
  /**
   * Colorblind mode's texture, by side: the buckets that share a color (Short and Long, Bunched and
   * Long gap) are told apart by pattern as well as position.
   */
  pattern: PatternShape;
}

const SIDE_PATTERNS: Record<HeadwayBucket['side'], PatternShape> = {
  closer: 'diagonal',
  on: 'solid',
  longer: 'dots',
};

/**
 * Each headway count in ratio order. Colors follow the severity ramp the trip charts use for
 * headway dots, except long gaps take its top (purple) step so they stand apart from bunching.
 * Getters, so colorblind mode's ramp applies.
 */
export const HEADWAY_BUCKETS: HeadwayBucket[] = [
  {
    field: 'headways_under_50',
    label: 'Bunched',
    range: '≤50%',
    side: 'closer',
    pattern: SIDE_PATTERNS.closer,
    get color() {
      return SEVERITY_COLORS.off50;
    },
  },
  {
    field: 'headways_50_75',
    label: 'Short',
    range: '50–75%',
    side: 'closer',
    pattern: SIDE_PATTERNS.closer,
    get color() {
      return SEVERITY_COLORS.off25;
    },
  },
  {
    field: 'headways_75_125',
    label: 'On time',
    range: '75–125%',
    side: 'on',
    pattern: SIDE_PATTERNS.on,
    get color() {
      return SEVERITY_COLORS.onTime;
    },
  },
  {
    field: 'headways_125_150',
    label: 'Long',
    range: '125–150%',
    side: 'longer',
    pattern: SIDE_PATTERNS.longer,
    get color() {
      return SEVERITY_COLORS.off25;
    },
  },
  {
    field: 'headways_over_150',
    label: 'Long gap',
    range: '≥150%',
    side: 'longer',
    pattern: SIDE_PATTERNS.longer,
    get color() {
      return SEVERITY_COLORS.off100;
    },
  },
];

/** Read at draw time, not copied into a constant, so it follows colorblind mode. */
export const bucketColor = (field: HeadwayField) =>
  HEADWAY_BUCKETS.find((bucket) => bucket.field === field)!.color;

export const OFF_SCHEDULE_BUCKETS = HEADWAY_BUCKETS.filter(({ side }) => side !== 'on');

/** "both" for every headway, or a GTFS direction_id. */
import type { HeadwayDirection } from '../../common/hooks/usePageFilters';

export type { HeadwayDirection };

/** One period's headway counts, for every headway or just one direction's. */
export interface HeadwayRow {
  date: string;
  counts?: PartialHeadwayCounts;
}

export const toHeadwayRows = (
  data: ReliabilityEntry[],
  direction: HeadwayDirection
): HeadwayRow[] =>
  data.map((entry) => ({
    date: entry.date,
    counts: direction === 'both' ? entry : entry.byDirection?.[direction],
  }));

/** Every headway count summed over the range. */
export const getHeadwayTotals = (rows: HeadwayRow[]) =>
  Object.fromEntries(
    HEADWAY_FIELDS.map((field) => [
      field,
      rows.reduce((t, row) => t + (row.counts?.[field] ?? 0), 0),
    ])
  ) as HeadwayCounts;

/** Plain headway counts per period, for the CSV download. */
export const toCsvRows = (rows: HeadwayRow[]) =>
  rows.map((row) => ({
    date: row.date,
    ...Object.fromEntries(HEADWAY_FIELDS.map((field) => [field, row.counts?.[field] ?? 0])),
  }));
