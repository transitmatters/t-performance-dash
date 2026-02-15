import type {
  DeliveredTripMetrics,
  DayDelayTotals,
  RidershipCount,
} from '../../common/types/dataPoints';
import type { LineDelays } from '../../common/types/delays';
import type { Line } from '../../common/types/lines';
import {
  PEAK_SCHEDULED_SERVICE,
  PEAK_SPEED,
  PEAK_RIDERSHIP,
} from '../../common/constants/baselines';

export type SubwayLine = 'line-red' | 'line-orange' | 'line-blue' | 'line-green';

export const SUBWAY_LINES: SubwayLine[] = ['line-red', 'line-orange', 'line-blue', 'line-green'];

export const SECONDARY_LINES: Line[] = [
  'line-mattapan',
  'line-bus',
  'line-commuter-rail',
  'line-ferry',
];

type SlowZoneLineKey = SubwayLine | 'line-mattapan';

const SLOW_ZONE_LINE_TO_SHORT: Record<SlowZoneLineKey, keyof DayDelayTotals> = {
  'line-red': 'Red',
  'line-orange': 'Orange',
  'line-blue': 'Blue',
  'line-green': 'Green',
  'line-mattapan': 'Mattapan',
};

// Shared slow zone reference (seconds). Any line at or above this level scores 0 for slow zones.
// Using a shared reference means lines with historically low slow zones aren't unfairly penalized.
const SLOW_ZONE_REFERENCE_MAX = 1000;

// Base weights for all 5 metrics. When a metric is unavailable for a line,
// its weight is redistributed proportionally across the remaining metrics.
const BASE_WEIGHTS: Record<string, number> = {
  service: 0.3,
  speed: 0.25,
  slowZones: 0.25,
  delays: 0.1,
  ridership: 0.1,
};

export interface LineGradeResult {
  score: number;
  letter: string;
  components: {
    service: number;
    speed: number;
    slowZones: number;
    delays: number;
    ridership: number;
  };
}

export interface ScheduledServiceData {
  current: number; // Latest week's scheduled trips
  baseline: number; // Pre-COVID baseline trips
}

export interface GradeInput {
  line: Line;
  tripMetrics?: DeliveredTripMetrics[];
  slowZoneTotals?: DayDelayTotals[];
  delayData?: LineDelays[];
  ridershipData?: RidershipCount[];
  scheduledService?: ScheduledServiceData;
}

function normalizePositive(current: number, peak: number): number {
  if (peak <= 0) return 0;
  const pct = (current / peak) * 100;
  return Math.min(110, Math.max(0, pct));
}

function normalizeInverted(current: number, peakBad: number): number {
  if (peakBad <= 0) return 110;
  return Math.max(0, 110 - (current / peakBad) * 110);
}

export function scoreToLetter(score: number): string {
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 50) return 'D-';
  return 'F';
}

function percentile90(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * 0.9);
  return sorted[Math.min(idx, sorted.length - 1)];
}

function hasData<T>(arr?: T[]): arr is T[] {
  return !!arr && arr.length > 0;
}

function isSlowZoneLine(line: Line): line is SlowZoneLineKey {
  return line in SLOW_ZONE_LINE_TO_SHORT;
}

/**
 * Find the most recent non-zero entry in an array, searching backwards.
 * Returns undefined if no non-zero entry exists.
 */
function findLatestNonZero<T>(arr: T[], getValue: (item: T) => number): T | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (getValue(arr[i]) > 0) return arr[i];
  }
  return undefined;
}

/**
 * Compute a line's composite grade from all available data.
 * Metrics without data are excluded and their weights redistributed proportionally.
 * Component scores use -1 to indicate "not applicable".
 * Weeks with 0 data are skipped (e.g. ferry in winter) — uses most recent non-zero value.
 */
export function computeLineGrade(input: GradeInput): LineGradeResult {
  const { line, tripMetrics, slowZoneTotals, delayData, ridershipData, scheduledService } = input;

  // Compute raw scores for available metrics
  const rawScores: Record<string, number> = {};
  const available: string[] = [];

  // Service: prefer actual trip metrics, fall back to scheduled service data
  if (hasData(tripMetrics) && PEAK_SCHEDULED_SERVICE[line] > 0) {
    const latest = findLatestNonZero(tripMetrics, (d) => d.count);
    if (latest) {
      rawScores.service = normalizePositive(latest.count, PEAK_SCHEDULED_SERVICE[line]);
      available.push('service');
    }
  } else if (scheduledService && scheduledService.baseline > 0) {
    rawScores.service = normalizePositive(scheduledService.current, scheduledService.baseline);
    available.push('service');
  }

  if (hasData(tripMetrics) && PEAK_SPEED[line] > 0) {
    const latest = findLatestNonZero(tripMetrics, (d) => d.miles_covered);
    if (latest && latest.miles_covered && latest.total_time) {
      const speed = latest.miles_covered / (latest.total_time / 3600);
      rawScores.speed = normalizePositive(speed, PEAK_SPEED[line]);
      available.push('speed');
    }
  }

  // Slow Zones
  if (hasData(slowZoneTotals) && isSlowZoneLine(line)) {
    const shortName = SLOW_ZONE_LINE_TO_SHORT[line];
    const latest = slowZoneTotals[slowZoneTotals.length - 1];
    const slowZoneDelay = (latest[shortName] as number) || 0;
    // Any slow zones at all incur a minimum 10-point penalty (capped at 100 instead of 110)
    rawScores.slowZones =
      slowZoneDelay > 0
        ? Math.min(100, normalizeInverted(slowZoneDelay, SLOW_ZONE_REFERENCE_MAX))
        : 110;
    available.push('slowZones');
  }

  // Delays (zero delay is good, not missing data — average all weeks)
  // Reference is 120% of the observed max, so a line has to exceed its worst week to score 0
  if (hasData(delayData)) {
    const totals = delayData.map((d) => d.total_delay_time);
    const avgDelay = totals.reduce((sum, t) => sum + t, 0) / totals.length;
    const reference = Math.max(...totals) * 1.2;
    rawScores.delays = normalizeInverted(avgDelay, reference);
    available.push('delays');
  }

  // Ridership (average all non-zero weeks to smooth out seasonal gaps)
  if (hasData(ridershipData) && PEAK_RIDERSHIP[line] > 0) {
    const nonZeroCounts = ridershipData.map((d) => d.count).filter((c) => c > 0);
    if (nonZeroCounts.length > 0) {
      const avgRidership = nonZeroCounts.reduce((sum, c) => sum + c, 0) / nonZeroCounts.length;
      rawScores.ridership = normalizePositive(avgRidership, PEAK_RIDERSHIP[line]);
      available.push('ridership');
    }
  }

  // No data at all — return empty grade
  if (available.length === 0) {
    return {
      score: 0,
      letter: 'F',
      components: { service: -1, speed: -1, slowZones: -1, delays: -1, ridership: -1 },
    };
  }

  // Redistribute weights proportionally across available metrics
  const totalBaseWeight = available.reduce((sum, key) => sum + BASE_WEIGHTS[key], 0);
  let weightedAverage = 0;
  for (const key of available) {
    const normalizedWeight = BASE_WEIGHTS[key] / totalBaseWeight;
    weightedAverage += rawScores[key] * normalizedWeight;
  }

  const finalScore = Math.round((weightedAverage / 110) * 100);
  const clampedScore = Math.max(0, Math.min(100, finalScore));

  return {
    score: clampedScore,
    letter: scoreToLetter(clampedScore),
    components: {
      service: 'service' in rawScores ? Math.round((rawScores.service / 110) * 100) : -1,
      speed: 'speed' in rawScores ? Math.round((rawScores.speed / 110) * 100) : -1,
      slowZones: 'slowZones' in rawScores ? Math.round((rawScores.slowZones / 110) * 100) : -1,
      delays: 'delays' in rawScores ? Math.round((rawScores.delays / 110) * 100) : -1,
      ridership: 'ridership' in rawScores ? Math.round((rawScores.ridership / 110) * 100) : -1,
    },
  };
}
