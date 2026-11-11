import type { SingleDayDataPoint } from '../../../common/types/charts';

type HeadwayTrip = Pick<SingleDayDataPoint, 'headway_time_sec' | 'benchmark_headway_time_sec'>;

export interface HeadwayBucket {
  count: number;
  pctTrips: number;
  // The scheduled headways of the trips in this bucket. They change through the day, so a bucket
  // holding both peak and off-peak trips spans several.
  benchmark?: { median: number; min: number; max: number };
}

const median = (sorted: number[]) => {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Counts headways into whole-minute buckets, filling empty buckets up to the longest headway.
 * Each key is the bucket's start plus 0.5, so Chart.js draws the tick labels between the bars.
 */
export const getHeadwayBuckets = (headways: HeadwayTrip[]): Record<string, HeadwayBucket> => {
  const trips = headways.filter(
    (trip): trip is HeadwayTrip & { headway_time_sec: number } => (trip.headway_time_sec ?? -1) >= 0
  );
  const keys = trips.map((trip) => Math.floor(trip.headway_time_sec / 60) + 0.5);
  const max = Math.max(...keys);

  const counts: Record<string, number> = {};
  const benchmarks: Record<string, number[]> = {};
  for (let i = 0.5; i <= max; i++) {
    counts[i] = 0;
    benchmarks[i] = [];
  }
  trips.forEach((trip, index) => {
    counts[keys[index]] += 1;
    const benchmark = trip.benchmark_headway_time_sec;
    if (benchmark && benchmark > 0) benchmarks[keys[index]].push(benchmark);
  });

  return Object.fromEntries(
    Object.entries(counts).map(([key, count]) => {
      const sorted = benchmarks[key].sort((a, b) => a - b);
      return [
        key,
        {
          count,
          pctTrips: Math.floor((100 * count) / headways.length),
          benchmark: sorted.length
            ? { median: median(sorted), min: sorted[0], max: sorted[sorted.length - 1] }
            : undefined,
        },
      ];
    })
  );
};
