import { useMemo } from 'react';
import { useSlowzoneAllData } from '../../common/api/hooks/slowzones';
import { useDisplayStore } from '../../common/state/displayStore';
import type { Station } from '../../common/types/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
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
  trip: { fromStation: Station; toStation: Station } | undefined,
  startDate: string | undefined,
  endDate: string | undefined
): TripSlowZones | undefined => {
  const show = useDisplayStore((state) => state.showSlowZones);
  const { lineShort, color } = useDelimitatedRoute();
  const enabled = Boolean(show && trip && startDate && endDate && isSlowZonesLine(lineShort));
  const { data, isLoading } = useSlowzoneAllData(enabled);
  const runs = useMemo(
    () =>
      enabled && data && trip && startDate && endDate
        ? getTripSlowZoneRuns(
            data.data,
            trip.fromStation,
            trip.toStation,
            lineShort,
            startDate,
            endDate
          )
        : [],
    [enabled, data, trip, lineShort, startDate, endDate]
  );
  if (!enabled) return undefined;
  return { runs, isLoading, color };
};
