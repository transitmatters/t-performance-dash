import type { LineData, ServiceDay, ServiceRegime } from '../../serviceAndRidership/types';

// The MBTA service day starts around 3 AM; trips after midnight belong to the day before.
const SERVICE_DAY_START_HOUR = 3;
const DAY_WEIGHTS: Record<ServiceDay, number> = { weekday: 5, saturday: 1, sunday: 1 };

export interface GoalCoverage {
  /** Weighted service hours meeting the goal. */
  met: number;
  /** Weighted service hours, first trip to last. */
  total: number;
}

const emptyCoverage = (): GoalCoverage => ({ met: 0, total: 0 });

/**
 * Hours from the first to the last trip of each service day. Gaps with no trips count as service
 * hours that miss the goal: a line that runs every two hours isn't "on time" in the hour between.
 * `tripsPerHour` is one direction, so a 10-minute goal needs 6 trips in the hour.
 */
export const goalCoverage = (
  line: LineData,
  goalMinutes: number,
  regime: ServiceRegime = 'current'
): GoalCoverage => {
  const needed = 60 / goalMinutes;
  const coverage = emptyCoverage();
  (Object.keys(DAY_WEIGHTS) as ServiceDay[]).forEach((day) => {
    const levels = line.serviceRegimes[regime]?.[day];
    if (!levels || levels.cancelled || !levels.tripsPerHour) return;
    const hours = [
      ...levels.tripsPerHour.slice(SERVICE_DAY_START_HOUR),
      ...levels.tripsPerHour.slice(0, SERVICE_DAY_START_HOUR),
    ];
    const first = hours.findIndex((tph) => tph > 0);
    const last = hours.findLastIndex((tph) => tph > 0);
    if (first < 0) return;
    const span = hours.slice(first, last + 1);
    coverage.total += span.length * DAY_WEIGHTS[day];
    coverage.met += span.filter((tph) => tph >= needed).length * DAY_WEIGHTS[day];
  });
  return coverage;
};

export const combineCoverage = (
  coverages: { coverage: GoalCoverage; weight?: number }[]
): number | null => {
  // With weights (riders), each line's share counts in proportion to its weight; without, lines
  // count by their service hours.
  const weighted = coverages.some((c) => c.weight !== undefined);
  let met = 0;
  let total = 0;
  coverages.forEach(({ coverage, weight }) => {
    if (!coverage.total) return;
    if (weighted) {
      met += (coverage.met / coverage.total) * (weight ?? 0);
      total += weight ?? 0;
    } else {
      met += coverage.met;
      total += coverage.total;
    }
  });
  return total ? met / total : null;
};

/** Median midday (10 AM–3 PM) headway in minutes across `lines` for a service day. */
export const middayHeadway = (lines: LineData[], day: ServiceDay): number | null => {
  const headways = lines
    .map((line) => {
      const tph = line.serviceRegimes.current?.[day]?.tripsPerHour;
      if (!tph) return null;
      const midday = tph.slice(10, 15);
      const avg = midday.reduce((sum, v) => sum + v, 0) / midday.length;
      return avg > 0 ? 60 / avg : null;
    })
    .filter((h): h is number => h !== null)
    .sort((a, b) => a - b);
  if (!headways.length) return null;
  const mid = Math.floor(headways.length / 2);
  return headways.length % 2 ? headways[mid] : (headways[mid - 1] + headways[mid]) / 2;
};
