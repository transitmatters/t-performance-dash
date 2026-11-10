import { useQuery } from '@tanstack/react-query';
import {
  fetchAllSlow,
  fetchDelayTotals,
  fetchSpeedRestrictions,
  fetchZoneDelays,
} from '../slowzones';
import { ONE_HOUR } from '../../constants/time';
import type { FetchSpeedRestrictionsOptions } from '../../types/api';
import type { SpeedRestriction } from '../../types/dataPoints';
import type { LineShort } from '../../types/lines';
import { SLOW_ZONES_LINES } from '../../../modules/slowzones/types';
import type { SlowZonesLineName } from '../../../modules/slowzones/types';

export const useSlowzoneAllData = () => {
  return useQuery({ queryKey: ['allSlow'], queryFn: fetchAllSlow, staleTime: ONE_HOUR });
};

export const useSlowzoneDelayTotalData = () => {
  return useQuery({ queryKey: ['delayTotals'], queryFn: fetchDelayTotals, staleTime: ONE_HOUR });
};

/** Per-day delay for every slow zone on a line. Consumers should fall back to all_slow if this errors. */
export const useSlowzoneZoneDelays = (lineShort: LineShort | undefined) => {
  const isSlowZonesLine = SLOW_ZONES_LINES.includes(lineShort as SlowZonesLineName);
  return useQuery({
    queryKey: ['zoneDelays', lineShort],
    queryFn: () => fetchZoneDelays(lineShort as SlowZonesLineName),
    enabled: isSlowZonesLine,
    staleTime: ONE_HOUR,
  });
};

// Retired 2026-09-21: the upstream ArcGIS source data-ingestion reads from is
// gone (400 upstream), and the SpeedRestrictions table hasn't had a new row
// since 2026-05-31. The backend clamps out-of-range dates to the latest row
// and still reports it as "available", so left on this silently renders
// 4-month-stale restrictions as current. Disabled here pending a reply from
// the T on whether the dataset moved; restore `options.date !== undefined`
// once it's live again.
//
// `initialData: []` keeps this query in a resolved state (isLoading: false,
// data: []) instead of stuck pending forever -- SlowZonesDetails and
// SystemSlowZonesDetails pass this straight into <Widget ready={...}>, which
// treats a disabled, never-fetched query as perpetually "waiting" and never
// renders the map. This was shipped broken in #1180.
export const useSpeedRestrictionData = (options: FetchSpeedRestrictionsOptions) => {
  return useQuery({
    queryKey: ['speedRestrictions', options],
    queryFn: () => fetchSpeedRestrictions(options),
    enabled: false,
    initialData: [] as SpeedRestriction[],
    staleTime: ONE_HOUR,
  });
};
