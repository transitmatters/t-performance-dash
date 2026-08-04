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

// Hardcoded electrification percentage by line (0-100). Only applies to commuter rail for now.
const ELECTRIFICATION_PCT: Partial<Record<Line, number>> = {
  'line-commuter-rail': 0,
};

// The raw score ceiling. A metric must exceed its peak by this ratio to score 100.
// At 110, hitting 100% of peak scores ~91. At 125, hitting 100% of peak scores 80.
const RAW_CEILING = 125;

// Shared slow zone reference (seconds). Any line at or above this level scores 0 for slow zones.
// Using a shared reference means lines with historically low slow zones aren't unfairly penalized.
const SLOW_ZONE_REFERENCE_MAX = 1000;

// Base weights for all 5 metrics. When a metric is unavailable for a line,
// its weight is redistributed proportionally across the remaining metrics.
const BASE_WEIGHTS: Record<string, number> = {
  service: 0.3,
  scheduledService: 0.1,
  speed: 0.25,
  slowZones: 0.25,
  delays: 0.1,
  ridership: 0.1,
  fleetAge: 0.15,
  electrification: 0.05,
};

export type Trend = 'up' | 'down' | 'stable';

export interface ComponentScore {
  score: number;
  trend: Trend;
}

export interface LineGradeResult {
  score: number;
  rating: string;
  trend: Trend;
  components: {
    service: ComponentScore;
    speed: ComponentScore;
    slowZones: ComponentScore;
    delays: ComponentScore;
    ridership: ComponentScore;
    fleetAge: ComponentScore;
    electrification: ComponentScore;
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
  return Math.min(RAW_CEILING, Math.max(0, pct));
}

/** Quadratic curve for fleet age: gentle penalty 10-20 years, steep 20-30. ≤10 = ceiling, ≥30 = 0. */
function scoreFleetAge(age: number): number {
  const t = age <= 10 ? 0 : age >= 30 ? 1 : (age - 10) / 20;
  return RAW_CEILING * (1 - t * t);
}

function normalizeInverted(current: number, peakBad: number): number {
  if (peakBad <= 0) return RAW_CEILING;
  return Math.max(0, RAW_CEILING - (current / peakBad) * RAW_CEILING);
}

export function scoreToRating(score: number): string {
  if (score >= 95) return 'World Class';
  if (score >= 85) return 'Good';
  if (score >= 75) return 'Almost Good';
  if (score >= 60) return 'Needs Work';
  if (score >= 40) return 'Poor';
  return 'Failing';
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
 * Compute a trend by comparing recent data (last 2 entries) against the full period.
 * Returns 'up' if recent > full by more than 5 points, 'down' if less by more than 5, else 'stable'.
 */
function computeTrend(fullScore: number, recentScore: number): Trend {
  const diff = recentScore - fullScore;
  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}

function noComponent(): ComponentScore {
  return { score: -1, trend: 'stable' };
}

function makeComponent(fullRaw: number, recentRaw: number): ComponentScore {
  const score = Math.round((fullRaw / RAW_CEILING) * 100);
  const recentScore = Math.round((recentRaw / RAW_CEILING) * 100);
  return { score, trend: computeTrend(score, recentScore) };
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
  const recentRawScores: Record<string, number> = {};
  const available: string[] = [];
  // Track which weight key to use for service
  let serviceWeightKey = 'service';

  // Service: prefer actual trip metrics, fall back to scheduled service data
  if (hasData(tripMetrics) && PEAK_SCHEDULED_SERVICE[line] > 0) {
    const latest = findLatestNonZero(tripMetrics, (d) => d.count);
    if (latest) {
      rawScores.service = normalizePositive(latest.count, PEAK_SCHEDULED_SERVICE[line]);
      // Recent: use last 2 entries
      const recentEntries = tripMetrics.slice(-2);
      const recentLatest = findLatestNonZero(recentEntries, (d) => d.count);
      recentRawScores.service = recentLatest
        ? normalizePositive(recentLatest.count, PEAK_SCHEDULED_SERVICE[line])
        : rawScores.service;
      available.push('service');
    }
  } else if (scheduledService && scheduledService.baseline > 0) {
    rawScores.service = normalizePositive(scheduledService.current, scheduledService.baseline);
    recentRawScores.service = rawScores.service; // scheduled service is a single snapshot, no trend
    serviceWeightKey = 'scheduledService';
    available.push('service');
  }

  if (hasData(tripMetrics) && PEAK_SPEED[line] > 0) {
    const latest = findLatestNonZero(tripMetrics, (d) => d.miles_covered);
    if (latest && latest.miles_covered && latest.total_time) {
      const speed = latest.miles_covered / (latest.total_time / 3600);
      rawScores.speed = normalizePositive(speed, PEAK_SPEED[line]);
      // Recent: use last 2 entries
      const recentEntries = tripMetrics.slice(-2);
      const recentLatest = findLatestNonZero(recentEntries, (d) => d.miles_covered);
      if (recentLatest && recentLatest.miles_covered && recentLatest.total_time) {
        const recentSpeed = recentLatest.miles_covered / (recentLatest.total_time / 3600);
        recentRawScores.speed = normalizePositive(recentSpeed, PEAK_SPEED[line]);
      } else {
        recentRawScores.speed = rawScores.speed;
      }
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
        ? Math.min(RAW_CEILING - 10, normalizeInverted(slowZoneDelay, SLOW_ZONE_REFERENCE_MAX))
        : RAW_CEILING;
    // Recent: last 2 entries
    const recentEntries = slowZoneTotals.slice(-2);
    const recentLatest = recentEntries[recentEntries.length - 1];
    const recentDelay = (recentLatest[shortName] as number) || 0;
    recentRawScores.slowZones =
      recentDelay > 0
        ? Math.min(RAW_CEILING - 10, normalizeInverted(recentDelay, SLOW_ZONE_REFERENCE_MAX))
        : RAW_CEILING;
    available.push('slowZones');
  }

  // Delays (zero delay is good, not missing data — average all weeks)
  // Reference is 120% of the observed max, so a line has to exceed its worst week to score 0
  if (hasData(delayData)) {
    const totals = delayData.map((d) => d.total_delay_time);
    const avgDelay = totals.reduce((sum, t) => sum + t, 0) / totals.length;
    const reference = Math.max(...totals) * 1.2;
    rawScores.delays = normalizeInverted(avgDelay, reference);
    // Recent: last 2 entries
    const recentTotals = delayData.slice(-2).map((d) => d.total_delay_time);
    const recentAvg = recentTotals.reduce((sum, t) => sum + t, 0) / recentTotals.length;
    recentRawScores.delays = normalizeInverted(recentAvg, reference);
    available.push('delays');
  }

  // Fleet Age (from trip metrics avg_car_age field, rapid transit only)
  // ≤10 years = perfect, ≥30 years = 0, linear between
  if (hasData(tripMetrics)) {
    const latest = findLatestNonZero(tripMetrics, (d) => d.avg_car_age ?? 0);
    if (latest?.avg_car_age != null) {
      const age = latest.avg_car_age;
      const ageScore = scoreFleetAge(age);
      rawScores.fleetAge = ageScore;
      // Recent: last 2 entries
      const recentEntries = tripMetrics.slice(-2);
      const recentLatest = findLatestNonZero(recentEntries, (d) => d.avg_car_age ?? 0);
      if (recentLatest?.avg_car_age != null) {
        const recentAge = recentLatest.avg_car_age;
        recentRawScores.fleetAge = scoreFleetAge(recentAge);
      } else {
        recentRawScores.fleetAge = rawScores.fleetAge;
      }
      available.push('fleetAge');
    }
  }

  // Ridership (average all non-zero weeks to smooth out seasonal gaps)
  if (hasData(ridershipData) && PEAK_RIDERSHIP[line] > 0) {
    const nonZeroCounts = ridershipData.map((d) => d.count).filter((c) => c > 0);
    if (nonZeroCounts.length > 0) {
      const avgRidership = nonZeroCounts.reduce((sum, c) => sum + c, 0) / nonZeroCounts.length;
      rawScores.ridership = normalizePositive(avgRidership, PEAK_RIDERSHIP[line]);
      // Recent: last 2 entries
      const recentCounts = ridershipData
        .slice(-2)
        .map((d) => d.count)
        .filter((c) => c > 0);
      if (recentCounts.length > 0) {
        const recentAvg = recentCounts.reduce((sum, c) => sum + c, 0) / recentCounts.length;
        recentRawScores.ridership = normalizePositive(recentAvg, PEAK_RIDERSHIP[line]);
      } else {
        recentRawScores.ridership = rawScores.ridership;
      }
      available.push('ridership');
    }
  }

  // Electrification (hardcoded percentage, currently only commuter rail)
  if (line in ELECTRIFICATION_PCT) {
    const pct = ELECTRIFICATION_PCT[line]!;
    rawScores.electrification = (pct / 100) * RAW_CEILING;
    recentRawScores.electrification = rawScores.electrification;
    available.push('electrification');
  }

  // No data at all — return empty grade
  if (available.length === 0) {
    return {
      score: 0,
      rating: 'Failing',
      trend: 'stable',
      components: {
        service: noComponent(),
        speed: noComponent(),
        slowZones: noComponent(),
        delays: noComponent(),
        ridership: noComponent(),
        fleetAge: noComponent(),
        electrification: noComponent(),
      },
    };
  }

  // Redistribute weights proportionally across available metrics
  // Use the correct weight key for service (scheduledService has lower weight)
  const totalBaseWeight = available.reduce((sum, key) => {
    const weightKey = key === 'service' ? serviceWeightKey : key;
    return sum + BASE_WEIGHTS[weightKey];
  }, 0);
  let weightedAverage = 0;
  let recentWeightedAverage = 0;
  for (const key of available) {
    const weightKey = key === 'service' ? serviceWeightKey : key;
    const normalizedWeight = BASE_WEIGHTS[weightKey] / totalBaseWeight;
    weightedAverage += rawScores[key] * normalizedWeight;
    recentWeightedAverage += (recentRawScores[key] ?? rawScores[key]) * normalizedWeight;
  }

  const finalScore = Math.round((weightedAverage / RAW_CEILING) * 100);
  const clampedScore = Math.max(0, Math.min(100, finalScore));
  const recentFinalScore = Math.round((recentWeightedAverage / RAW_CEILING) * 100);
  const recentClamped = Math.max(0, Math.min(100, recentFinalScore));
  const overallTrend: Trend =
    recentClamped > clampedScore ? 'up' : recentClamped < clampedScore ? 'down' : 'stable';

  return {
    score: clampedScore,
    rating: scoreToRating(clampedScore),
    trend: overallTrend,
    components: {
      service:
        'service' in rawScores
          ? makeComponent(rawScores.service, recentRawScores.service)
          : noComponent(),
      speed:
        'speed' in rawScores
          ? makeComponent(rawScores.speed, recentRawScores.speed)
          : noComponent(),
      slowZones:
        'slowZones' in rawScores
          ? makeComponent(rawScores.slowZones, recentRawScores.slowZones)
          : noComponent(),
      delays:
        'delays' in rawScores
          ? makeComponent(rawScores.delays, recentRawScores.delays)
          : noComponent(),
      ridership:
        'ridership' in rawScores
          ? makeComponent(rawScores.ridership, recentRawScores.ridership)
          : noComponent(),
      fleetAge:
        'fleetAge' in rawScores
          ? makeComponent(rawScores.fleetAge, recentRawScores.fleetAge)
          : noComponent(),
      electrification:
        'electrification' in rawScores
          ? makeComponent(rawScores.electrification, recentRawScores.electrification)
          : noComponent(),
    },
  };
}
