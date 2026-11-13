import type { BusTripCounts } from '../types/dataPoints';

/**
 * A bus route's service, from LAMP's trip counts: every scheduled trip, and the ones with no
 * observed stop. A trip with no observed stop is our estimate of a dropped trip, though a bus that
 * ran with its tracking off looks the same. The counts start 2025-12-24.
 */
export interface TripTotals {
  scheduled: number;
  dropped: number;
  /** The dropped trips that have an MBTA waiver */
  waived: number;
}

export const sumTrips = (rows: BusTripCounts[]): TripTotals =>
  rows.reduce(
    (totals, row) => ({
      scheduled: totals.scheduled + (row.scheduled_trips ?? 0),
      dropped: totals.dropped + (row.unobserved_trips ?? 0),
      waived: totals.waived + (row.unobserved_waived_trips ?? 0),
    }),
    { scheduled: 0, dropped: 0, waived: 0 }
  );

/**
 * Few of the route's dropped trips have a waiver, so some may be buses that ran untracked: Routes
 * 712 and 713 read 12–14% dropped in October 2026 with no waivers at all. Needs enough trips for the
 * share to mean something.
 */
const MIN_DROPPED_FOR_WAIVER_CHECK = 10;
const MAX_WAIVED_SHARE = 0.1;
export const mayIncludeTrackingGaps = ({ dropped, waived }: TripTotals) =>
  dropped >= MIN_DROPPED_FOR_WAIVER_CHECK && waived < MAX_WAIVED_SHARE * dropped;
