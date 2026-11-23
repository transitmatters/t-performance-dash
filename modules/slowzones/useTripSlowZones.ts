import { useMemo } from 'react';
import { useSlowzoneAllData } from '../../common/api/hooks/slowzones';
import { useDisplayStore } from '../../common/state/displayStore';
import type { SlowZonesTrip } from '../../common/types/charts';
import { getTripSlowZoneRuns } from '../../common/utils/slowZoneUtils';
import type { TripSlowZoneRun } from '../../common/utils/slowZoneUtils';
import { isSlowZonesLine } from './types';

export interface TripSlowZones {
  runs: TripSlowZoneRun[];
  isLoading: boolean;
  color: string;
}

/**
 * The slow zones on a subway trip over the given dates, for its chart's context track. Undefined
 * when the reader has turned them off, or the trip isn't on a line with slow zones.
 */
export const useTripSlowZones = (
  trip: SlowZonesTrip | undefined,
  startDate: string,
  endDate: string
): TripSlowZones | undefined => {
  const show = useDisplayStore((state) => state.showSlowZones);
  const enabled = Boolean(show && trip && isSlowZonesLine(trip.lineShort));
  const { data, isLoading } = useSlowzoneAllData(enabled);
  const runs = useMemo(
    () =>
      enabled && data && trip
        ? getTripSlowZoneRuns(
            data.data,
            trip.fromStation,
            trip.toStation,
            trip.lineShort,
            startDate,
            endDate
          )
        : [],
    [enabled, data, trip, startDate, endDate]
  );
  if (!enabled || !trip) return undefined;
  return { runs, isLoading, color: trip.color };
};
