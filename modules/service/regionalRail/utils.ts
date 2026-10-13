import type { DataPoint } from '../../../common/components/charts/TimeSeriesChart';
import type { CrScorecardEntry, ScorecardDirection } from '../../../common/types/dataPoints';

/** Each direction is measured at its Boston terminal: outbound leaving it, inbound reaching it. */
export const DIRECTIONS = [
  { key: 'outbound', label: 'Outbound' },
  { key: 'inbound', label: 'Inbound' },
] as const;

export type Direction = (typeof DIRECTIONS)[number]['key'];

// Regional Rail: a train at least every 30 minutes, both ways, from 5am to 1am
export const TARGET_HEADWAY_MINUTES = 30;
export const SPAN_HOURS = 20;

type Value = (entry: CrScorecardEntry) => number | null | undefined;

/** Map each period to a point, dropping periods without a value. */
export const toPoints = (
  data: CrScorecardEntry[],
  value: Value
): (DataPoint & { date: string })[] =>
  data.flatMap((entry) => {
    const v = value(entry);
    return entry.date && v != null && Number.isFinite(v) ? [{ date: entry.date, value: v }] : [];
  });

/** Mean across periods weighted by the days in each, skipping periods without a value. */
export const weightedMean = (data: CrScorecardEntry[], value: Value): number | undefined => {
  let total = 0;
  let days = 0;
  for (const entry of data) {
    const v = value(entry);
    if (v == null) continue;
    total += v * entry.days;
    days += entry.days;
  }
  return days ? total / days : undefined;
};

export const directionMean = (
  data: CrScorecardEntry[],
  direction: Direction,
  field: keyof Omit<ScorecardDirection, 'byHour'>
) => weightedMean(data, (entry) => entry[direction][field]);

/** Average trains in each hour of the day, 0 through 23. */
export const averageByHour = (data: CrScorecardEntry[], direction: Direction): number[] =>
  Array.from(
    { length: 24 },
    (_, hour) => weightedMean(data, (entry) => entry[direction].byHour[hour]) ?? 0
  );

/** Regional Rail is measured both ways, so a line scores its weaker direction. */
export const getScorecardStats = (data: CrScorecardEntry[]) => {
  const both = (field: keyof Omit<ScorecardDirection, 'byHour'>) =>
    DIRECTIONS.map(({ key }) => directionMean(data, key, field)).filter(
      (v): v is number => v != null
    );
  const hoursAtTarget = both('hoursAtTarget');
  const middayGap = both('maxGapMidday');
  const eveningGap = both('maxGapEvening');
  const clockFace = both('clockFaceShare');
  return {
    tripsPerDay: weightedMean(data, (entry) => entry.outbound.trips + entry.inbound.trips),
    hoursAtTarget: hoursAtTarget.length ? Math.min(...hoursAtTarget) : undefined,
    maxGapMidday: middayGap.length ? Math.max(...middayGap) : undefined,
    maxGapEvening: eveningGap.length ? Math.max(...eveningGap) : undefined,
    clockFaceShare: clockFace.length
      ? clockFace.reduce((a, b) => a + b, 0) / clockFace.length
      : undefined,
    reversePeakTrips: weightedMean(data, (entry) => entry.reversePeakTrips),
  };
};

export const formatMinutes = (minutes?: number) => {
  if (minutes == null) return '—';
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded} min`;
  const remainder = rounded % 60;
  return remainder ? `${Math.floor(rounded / 60)} hr ${remainder} min` : `${rounded / 60} hr`;
};

export const formatCount = (value?: number) => (value == null ? '—' : `${Math.round(value)}`);

export const formatShare = (share?: number) =>
  share == null ? '—' : `${Math.round(share * 100)}%`;
